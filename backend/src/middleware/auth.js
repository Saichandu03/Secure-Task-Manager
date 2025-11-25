const jwt = require('jsonwebtoken');
const User = require('../models/User');
const inMemory = require('../config/inMemoryStore');

module.exports = async function (req, res, next) {
  try {
    const token = req.cookies && req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    const secret = process.env.JWT_SECRET || 'devsecret';
    const payload = jwt.verify(token, secret);
    if (!payload || !payload.id) return res.status(401).json({ error: 'Invalid token' });
    if (process.env.DEV_IN_MEMORY === '1') {
      const u = await inMemory.findUserById(payload.id);
      if (!u) return res.status(401).json({ error: 'User not found' });
      req.user = u;
      return next();
    }
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    console.warn('Auth middleware error', err.message);
    return res.status(401).json({ error: 'Not authenticated' });
  }
};
