const { v4: uuidv4 } = require('uuid');

const users = [];
const tasks = [];

module.exports = {
  async createUser(u) {
    const user = { id: uuidv4(), ...u };
    users.push(user);
    return user;
  },
  async findUserByEmail(email) { return users.find(u => u.email === email) },
  async findUserById(id) { return users.find(u => u.id === id) },

  async createTask(t) { const task = { id: uuidv4(), ...t }; tasks.push(task); return task },
  async findTasksByUserId(userId) { return tasks.filter(t => t.owner === userId) },
  async findTaskById(id) { return tasks.find(t => t.id === id) },
  async updateTask(id, changes) { const t = tasks.find(x=>x.id===id); if (!t) return null; Object.assign(t, changes); return t },
  async deleteTask(id) { const idx = tasks.findIndex(x=>x.id===id); if (idx===-1) return null; return tasks.splice(idx,1)[0] },
  getAllTasks() { return tasks }
};
