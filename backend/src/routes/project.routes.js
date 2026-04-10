const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getProjects, getProject, updateProject, toggleMilestone, deleteProject } = require('../controllers/project.controller');

router.use(protect);
router.get('/', getProjects);
router.get('/:id', getProject);
router.patch('/:id', authorize('director', 'coordinator'), updateProject);
router.patch('/:id/milestone/:milestoneId', toggleMilestone);
router.delete('/:id', authorize('director'), deleteProject);

module.exports = router;
