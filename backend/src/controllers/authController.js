const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const inMemory = require("../config/inMemoryStore");
const { validateRegister, validateLogin } = require("../utils/validators");
const { sanitizeUserInput } = require("../utils/sanitize");

function signToken(user) {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET || "devsecret",
    { expiresIn: "7d" }
  );
}

function cookieOptions() {
  const opts = { httpOnly: true, sameSite: "lax" };
  if (process.env.NODE_ENV === "production") opts.secure = true;
  return opts;
}

exports.register = async (req, res, next) => {
  try {
    const body = sanitizeUserInput(req.body || {});
    const { name, email, password } = body;
    const { valid, errors } = validateRegister({ name, email, password });
    if (!valid) return res.status(400).json({ errors });
    if (process.env.DEV_IN_MEMORY === "1") {
      const existing = await inMemory.findUserByEmail(email);
      if (existing)
        return res.status(400).json({ error: "Email already registered" });
      const hash = await bcrypt.hash(password, 10);
      const user = await inMemory.createUser({
        name,
        email,
        password: hash,
        role: "user",
      });
      const token = signToken(user);
      res.cookie("token", token, cookieOptions());
      return res
        .status(201)
        .json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
    }
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: "Email already registered" });
    const user = await User.create({ name, email, password });
    const token = signToken(user);
    res.cookie("token", token, cookieOptions());
    res
      .status(201)
      .json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const body = sanitizeUserInput(req.body || {});
    const { email, password } = body;
    const { valid, errors } = validateLogin({ email, password });
    if (!valid) return res.status(400).json({ errors });
    if (process.env.DEV_IN_MEMORY === "1") {
      const user = await inMemory.findUserByEmail(email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid credentials" });
      const token = signToken(user);
      res.cookie("token", token, cookieOptions());
      return res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const validPass = await user.comparePassword(password);
    if (!validPass)
      return res.status(401).json({ error: "Invalid credentials" });
    const token = signToken(user);
    res.cookie("token", token, cookieOptions());
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
};

exports.me = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const u = req.user.toObject ? req.user.toObject() : req.user;
    delete u.password;
    res.json({
      user: { id: u._id || u.id, name: u.name, email: u.email, role: u.role },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
