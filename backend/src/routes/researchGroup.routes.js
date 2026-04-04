const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getGroups, getGroup, createGroup, updateGroup, deleteGroup } = require('../controllers/researchGroup.controller');

router.use(protect);
router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/', authorize('admin', 'coordinator'), createGroup);
router.patch('/:id', authorize('admin', 'coordinator'), updateGroup);
router.delete('/:id', authorize('admin'), deleteGroup);

module.exports = router;
