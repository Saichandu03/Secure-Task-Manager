const Task = require("../models/Task");
const { validateTask } = require("../utils/validators");
const { sanitizeUserInput } = require("../utils/sanitize");
const redis = require("../config/redisClient");
const inMemory = require("../config/inMemoryStore");

// cacheKeyForUserTasks: produce a cache key for a user's tasks
function cacheKeyForUserTasks(userId) {
  return `tasks:user:${userId}`;
}

// Get tasks for the authenticated user
exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    const key = cacheKeyForUserTasks(userId);
    const cached = await redis.get(key);
    if (cached) return res.json({ tasks: JSON.parse(cached), cached: true });

    if (process.env.DEV_IN_MEMORY === "1") {
      const raw = await inMemory.getAllTasks();
      const list =
        req.user && req.user.role === "admin"
          ? raw
          : raw.filter((t) => String(t.owner) === String(userId));
      const tasks = await Promise.all(
        list.map(async (t) => {
          const owner = await inMemory.findUserById(t.owner);
          const createdBy = t.createdBy
            ? await inMemory.findUserById(t.createdBy)
            : null;
          const updatedBy = t.updatedBy
            ? await inMemory.findUserById(t.updatedBy)
            : null;
          return {
            ...t,
            owner: owner
              ? {
                  id: owner.id,
                  name: owner.name,
                  email: owner.email,
                  role: owner.role,
                }
              : t.owner,
            createdBy: createdBy
              ? {
                  id: createdBy.id,
                  name: createdBy.name,
                  email: createdBy.email,
                  role: createdBy.role,
                }
              : null,
            updatedBy: updatedBy
              ? {
                  id: updatedBy.id,
                  name: updatedBy.name,
                  email: updatedBy.email,
                  role: updatedBy.role,
                }
              : null,
          };
        })
      );
      await redis.set(key, JSON.stringify(tasks), 60);
      return res.json({ tasks });
    }

    const query =
      req.user && req.user.role === "admin" ? {} : { owner: userId };
    const tasks = await Task.find(query)
      .populate("owner", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({ createdAt: -1 });
    await redis.set(key, JSON.stringify(tasks), 60);
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// Create a new task
exports.createTask = async (req, res, next) => {
  try {
    const userId = req.user && (req.user._id || req.user.id);
    const body = sanitizeUserInput(req.body || {});
    const { valid, errors } = validateTask(body);
    if (!valid) return res.status(400).json({ errors });

    if (process.env.DEV_IN_MEMORY === "1") {
      const task = await inMemory.createTask({
        ...body,
        owner: userId,
        createdBy: userId,
      });
      const owner = await inMemory.findUserById(userId);
      const createdBy = await inMemory.findUserById(task.createdBy);
      const responseTask = {
        ...task,
        owner: owner
          ? { id: owner.id, name: owner.name, email: owner.email }
          : task.owner,
        createdBy: createdBy
          ? { id: createdBy.id, name: createdBy.name, email: createdBy.email }
          : null,
        updatedBy: null,
      };
      await redis.del(cacheKeyForUserTasks(userId));
      return res.status(201).json({ task: responseTask });
    }

    let task = await Task.create({ ...body, owner: userId, createdBy: userId });
    task = await task.populate([
      { path: "owner", select: "name email role" },
      { path: "createdBy", select: "name email role" },
    ]);
    await redis.del(cacheKeyForUserTasks(userId));
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// Update task by ID
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = sanitizeUserInput(req.body || {});
    const { valid, errors } = validateTask(body);
    if (!valid) return res.status(400).json({ errors });

    if (process.env.DEV_IN_MEMORY === "1") {
      const task = await inMemory.findTaskById(id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      const userId = (req.user && (req.user._id || req.user.id))?.toString();
      const isAdmin = req.user && req.user.role === "admin";
      if (!isAdmin && String(task.owner) !== String(userId))
        return res.status(403).json({ error: "Forbidden" });
      const now = new Date().toISOString();
      const changes = { ...body, updatedBy: userId, updatedAt: now };
      const updated = await inMemory.updateTask(id, changes);
      const owner = await inMemory.findUserById(updated.owner);
      const createdBy = updated.createdBy
        ? await inMemory.findUserById(updated.createdBy)
        : null;
      const updatedBy = updated.updatedBy
        ? await inMemory.findUserById(updated.updatedBy)
        : null;
      const response = {
        ...updated,
        owner: owner
          ? { id: owner.id, name: owner.name, email: owner.email }
          : updated.owner,
        createdBy: createdBy
          ? { id: createdBy.id, name: createdBy.name, email: createdBy.email }
          : null,
        updatedBy: updatedBy
          ? {
              id: updatedBy.id,
              name: updatedBy.name,
              email: updatedBy.email,
              role: updatedBy.role,
            }
          : null,
      };
      await redis.del(
        cacheKeyForUserTasks(
          response.owner && response.owner.id
            ? response.owner.id
            : response.owner
        )
      );
      return res.json({ task: response });
    }

    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    // compatibility: if createdBy was not set previously, default it to owner
    if (!task.createdBy) task.createdBy = task.owner;
    const userId = (req.user && (req.user._id || req.user.id))?.toString();
    const isAdmin = req.user && req.user.role === "admin";
    if (!isAdmin && task.owner.toString() !== userId)
      return res.status(403).json({ error: "Forbidden" });
    Object.assign(task, body);
    // record who edited the task
    task.updatedBy = userId;
    await task.save();
    const populated = await task.populate([
      { path: "owner", select: "name email role" },
      { path: "createdBy", select: "name email role" },
      { path: "updatedBy", select: "name email role" },
    ]);
    const ownerId =
      populated.owner && populated.owner._id
        ? populated.owner._id.toString()
        : userId;
    await redis.del(cacheKeyForUserTasks(ownerId));
    res.json({ task: populated });
  } catch (err) {
    next(err);
  }
};

// Delete task by ID
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (process.env.DEV_IN_MEMORY === "1") {
      const task = await inMemory.findTaskById(id);
      if (!task) return res.status(404).json({ error: "Task not found" });
      const userId = (req.user && (req.user._id || req.user.id))?.toString();
      // only owner may delete, admin may NOT delete others' tasks
      if (String(task.owner) !== String(userId))
        return res.status(403).json({ error: "Forbidden" });
      await inMemory.deleteTask(id);
      await redis.del(cacheKeyForUserTasks(task.owner.toString()));
      return res.json({ ok: true });
    }
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    const userId = (req.user && (req.user._id || req.user.id))?.toString();
    // only owner may delete; admin may not delete other users' tasks
    if (task.owner.toString() !== userId)
      return res.status(403).json({ error: "Forbidden" });
    await Task.findByIdAndDelete(id);
    await redis.del(cacheKeyForUserTasks(task.owner.toString()));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
