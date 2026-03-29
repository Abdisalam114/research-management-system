const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getPublicationsReport, getProjectsReport } = require('../controllers/report.controller');

router.use(protect);
router.use(authorize('admin', 'coordinator', 'finance'));
router.get('/publications', getPublicationsReport);
router.get('/projects', getProjectsReport);

module.exports = router;
