const User = require('../models/user.model');

// GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

// GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/approve
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved', user });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/reject
exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected', user });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, department, rank, phone, bio, role } = req.body;
    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user._id.toString() === req.params.id;
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Not authorized' });
    const updates = { name, department, rank, phone, bio };
    if (isAdmin && role) updates.role = role;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

// GET /api/users/me
exports.getMe = async (req, res) => res.json(req.user);
