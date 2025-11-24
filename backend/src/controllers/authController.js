const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(user) {
  return jwt.sign({ id: user._id || user.id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
}

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne ? User.findOne({ email }) : null;
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const user = await (User.create ? User.create({ name, email, password }) : null);
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true });
    res.json({ user: { id: user._id || user.id, name: user.name, email: user.email } });
  } catch (err) { next(err) }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await (User.findOne ? User.findOne({ email }) : null);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = user.comparePassword ? await user.comparePassword(password) : false;
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user);
    res.cookie('token', token, { httpOnly: true });
    res.json({ user: { id: user._id || user.id, name: user.name, email: user.email } });
  } catch (err) { next(err) }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
};
