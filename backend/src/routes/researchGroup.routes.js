const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getGroups, getGroup, createGroup, updateGroup, deleteGroup } = require('../controllers/researchGroup.controller');

router.use(protect);
router.get('/', getGroups);
router.get('/:id', getGroup);
router.post('/', authorize('director', 'coordinator'), createGroup);
router.patch('/:id', authorize('director', 'coordinator'), updateGroup);
router.delete('/:id', authorize('director'), deleteGroup);

module.exports = router;
