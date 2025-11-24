const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    const tasks = await (Task.find ? Task.find({ owner: userId }) : []);
    res.json({ tasks });
  } catch (err) { next(err) }
};

exports.createTask = async (req, res, next) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    const task = await (Task.create ? Task.create({ ...req.body, owner: userId }) : null);
    res.status(201).json({ task });
  } catch (err) { next(err) }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await (Task.findByIdAndUpdate ? Task.findByIdAndUpdate(id, req.body, { new: true }) : null);
    res.json({ task: updated });
  } catch (err) { next(err) }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    await (Task.findByIdAndDelete ? Task.findByIdAndDelete(id) : null);
    res.json({ ok: true });
  } catch (err) { next(err) }
};
