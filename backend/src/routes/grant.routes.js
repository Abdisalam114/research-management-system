const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getGrants, getGrant, createGrant, updateGrant, reviewGrant, deleteGrant } = require('../controllers/grant.controller');

router.use(protect);
router.get('/', getGrants);
router.get('/:id', getGrant);
router.post('/', createGrant);
router.patch('/:id', updateGrant);
router.patch('/:id/review', authorize('director'), reviewGrant);
router.delete('/:id', deleteGrant);

module.exports = router;
