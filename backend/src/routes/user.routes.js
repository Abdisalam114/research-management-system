const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getUsers, getUser, getUserProfile, approveUser, rejectUser, updateUser, deleteUser, getMe } = require('../controllers/user.controller');

router.use(protect);
router.get('/me', getMe);
router.get('/', getUsers);
router.get('/:id', getUser);
router.get('/:id/profile', getUserProfile);
router.patch('/:id/approve', authorize('director'), approveUser);
router.patch('/:id/reject', authorize('director'), rejectUser);
router.patch('/:id', updateUser);
router.delete('/:id', authorize('director'), deleteUser);

module.exports = router;
