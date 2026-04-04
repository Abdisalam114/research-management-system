const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getProposals, getProposal, createProposal, updateProposal, reviewProposal, decideProposal, deleteProposal, assignReviewer, updateEthics } = require('../controllers/proposal.controller');

router.use(protect);
router.get('/', getProposals);
router.get('/:id', getProposal);
router.post('/', createProposal);
router.patch('/:id', updateProposal);
router.patch('/:id/assign-reviewer', authorize('admin'), assignReviewer);
router.patch('/:id/review', authorize('coordinator'), reviewProposal);
router.patch('/:id/ethics', authorize('admin'), updateEthics);
router.patch('/:id/decision', authorize('admin'), decideProposal);
router.delete('/:id', deleteProposal);

module.exports = router;
