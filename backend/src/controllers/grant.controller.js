const Grant = require('../models/grant.model');
const Notification = require('../models/notification.model');

// GET /api/grants
exports.getGrants = async (req, res, next) => {
  try {
    const { status, type, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (department) filter.department = department;
    if (req.user.role === 'researcher') filter.applicant = req.user._id;
    const grants = await Grant.find(filter)
      .populate('applicant', 'name email department')
      .populate('coInvestigators', 'name email')
      .populate('project', 'title')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(grants);
  } catch (err) { next(err); }
};

// GET /api/grants/:id
exports.getGrant = async (req, res, next) => {
  try {
    const grant = await Grant.findById(req.params.id)
      .populate('applicant', 'name email department')
      .populate('coInvestigators', 'name email')
      .populate('project', 'title')
      .populate('reviewedBy', 'name');
    if (!grant) return res.status(404).json({ message: 'Grant not found' });
    res.json(grant);
  } catch (err) { next(err); }
};

// POST /api/grants
exports.createGrant = async (req, res, next) => {
  try {
    const {
      title, description, type, fundingSource, fundingAgency, amount,
      startDate, endDate, coInvestigators, project, department, budgetBreakdown
    } = req.body;
    const grant = await Grant.create({
      title, description, type, fundingSource, fundingAgency, amount,
      startDate, endDate, coInvestigators, project, department, budgetBreakdown,
      applicant: req.user._id, status: 'draft'
    });
    res.status(201).json(grant);
  } catch (err) { next(err); }
};

// PATCH /api/grants/:id
exports.updateGrant = async (req, res, next) => {
  try {
    const grant = await Grant.findById(req.params.id);
    if (!grant) return res.status(404).json({ message: 'Grant not found' });
    const isOwner = grant.applicant.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'director') return res.status(403).json({ message: 'Not authorized' });
    const allowed = ['title', 'description', 'type', 'fundingSource', 'fundingAgency', 'amount',
      'startDate', 'endDate', 'coInvestigators', 'project', 'department', 'budgetBreakdown', 'compliance'];
    allowed.forEach(f => { if (req.body[f] !== undefined) grant[f] = req.body[f]; });
    if (req.body.submit) grant.status = 'submitted';
    await grant.save();
    res.json(grant);
  } catch (err) { next(err); }
};

// PATCH /api/grants/:id/review (admin)
exports.reviewGrant = async (req, res, next) => {
  try {
    const { comment, action } = req.body; // action: 'approve' | 'reject'
    const grant = await Grant.findById(req.params.id);
    if (!grant) return res.status(404).json({ message: 'Grant not found' });
    grant.reviewedBy = req.user._id;
    grant.reviewComment = comment || '';
    grant.reviewedAt = new Date();
    grant.status = action === 'approve' ? 'approved' : 'rejected';
    await grant.save();

    // Send notification to applicant
    await Notification.create({
      recipient: grant.applicant,
      type: action === 'approve' ? 'grant_approved' : 'grant_rejected',
      title: `Grant ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your grant "${grant.title}" has been ${action === 'approve' ? 'approved' : 'rejected'}.${comment ? ' Comment: ' + comment : ''}`,
      link: '/grants',
      relatedModel: 'Grant',
      relatedId: grant._id
    });

    res.json(grant);
  } catch (err) { next(err); }
};

// DELETE /api/grants/:id
exports.deleteGrant = async (req, res, next) => {
  try {
    const grant = await Grant.findById(req.params.id);
    if (!grant) return res.status(404).json({ message: 'Grant not found' });
    const isOwner = grant.applicant.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'director') return res.status(403).json({ message: 'Not authorized' });
    await grant.deleteOne();
    res.json({ message: 'Grant deleted' });
  } catch (err) { next(err); }
};
