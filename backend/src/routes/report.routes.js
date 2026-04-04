const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { getPublicationsReport, getProjectsReport, getGrantsReport, getBudgetUtilizationReport, getFacultyProductivityReport } = require('../controllers/report.controller');

router.use(protect);
router.get('/publications', getPublicationsReport);
router.get('/projects', getProjectsReport);
router.get('/grants', authorize('admin', 'coordinator', 'finance'), getGrantsReport);
router.get('/budget-utilization', authorize('admin', 'finance'), getBudgetUtilizationReport);
router.get('/faculty-productivity', authorize('admin', 'coordinator'), getFacultyProductivityReport);

module.exports = router;
