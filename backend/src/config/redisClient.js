// Minimal no-op Redis client for dev/demo
module.exports = {
  async get() { return null },
  async set() { return null },
  async del() { return null },
  on() { return null }
};
