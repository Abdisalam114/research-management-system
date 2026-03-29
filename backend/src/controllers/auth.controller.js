const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, rank } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role: role || 'researcher', department, rank, status: 'pending' });
    res.status(201).json({ message: 'Registration successful. Await admin approval.', user });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.status === 'pending') return res.status(403).json({ message: 'Account pending admin approval' });
    if (user.status === 'rejected') return res.status(403).json({ message: 'Account has been rejected' });
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json({ accessToken, refreshToken, user });
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(403).json({ message: 'Invalid refresh token' });
    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save({ validateBeforeSave: false });
    res.json(tokens);
  } catch (err) { next(err); }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) { user.refreshToken = null; await user.save({ validateBeforeSave: false }); }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) { next(err); }
};
