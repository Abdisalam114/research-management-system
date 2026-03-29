const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getPublications, getPublication, createPublication, updatePublication, verifyPublication, deletePublication } = require('../controllers/publication.controller');

router.use(protect);
router.get('/', getPublications);
router.get('/:id', getPublication);
router.post('/', createPublication);
router.patch('/:id', updatePublication);
router.patch('/:id/verify', authorize('admin', 'coordinator'), verifyPublication);
router.delete('/:id', authorize('admin', 'coordinator'), deletePublication);

module.exports = router;
