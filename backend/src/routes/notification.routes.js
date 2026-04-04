const router = require('express').Router();
const { protect } = require('../middleware/auth.middleware');
const { getNotifications, markRead, markAllRead, deleteNotification } = require('../controllers/notification.controller');

router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.delete('/:id', deleteNotification);

module.exports = router;
