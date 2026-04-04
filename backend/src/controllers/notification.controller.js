const Notification = require('../models/notification.model');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const { read, limit } = req.query;
    const filter = { recipient: req.user._id };
    if (read !== undefined) filter.read = read === 'true';
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) { next(err); }
};

// PATCH /api/notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.json(notif);
  } catch (err) { next(err); }
};

// PATCH /api/notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// DELETE /api/notifications/:id
exports.deleteNotification = async (req, res, next) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Notification deleted' });
  } catch (err) { next(err); }
};

// Utility: create notification (used by other controllers)
exports.createNotification = async ({ recipient, type, title, message, link, relatedModel, relatedId }) => {
  try {
    return await Notification.create({ recipient, type, title, message, link, relatedModel, relatedId });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};
