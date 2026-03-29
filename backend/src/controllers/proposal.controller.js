const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Budget = require('../models/budget.model');

// GET /api/proposals
exports.getProposals = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    // Researchers only see their own
    if (req.user.role === 'researcher') filter.submittedBy = req.user._id;
    const proposals = await Proposal.find(filter)
      .populate('submittedBy', 'name email department')
      .populate('researchers', 'name email')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err) { next(err); }
};

// GET /api/proposals/:id
exports.getProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('submittedBy', 'name email')
      .populate('researchers', 'name email')
      .populate('coordinatorReview.reviewer', 'name')
      .populate('directorDecision.decidedBy', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (err) { next(err); }
};

// POST /api/proposals
exports.createProposal = async (req, res, next) => {
  try {
    const { title, abstract, keywords, researchers, estimatedBudget, duration, department } = req.body;
    const proposal = await Proposal.create({
      title, abstract, keywords, researchers, estimatedBudget, duration, department,
      submittedBy: req.user._id, status: 'draft'
    });
    res.status(201).json(proposal);
  } catch (err) { next(err); }
};

// PATCH /api/proposals/:id
exports.updateProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    const isOwner = proposal.submittedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    if (!['draft', 'rejected'].includes(proposal.status)) return res.status(400).json({ message: 'Proposal cannot be edited in current status' });
    const allowed = ['title', 'abstract', 'keywords', 'researchers', 'estimatedBudget', 'duration', 'department'];
    allowed.forEach(f => { if (req.body[f] !== undefined) proposal[f] = req.body[f]; });
    if (req.body.submit) proposal.status = 'submitted';
    await proposal.save();
    res.json(proposal);
  } catch (err) { next(err); }
};

// PATCH /api/proposals/:id/review (coordinator)
exports.reviewProposal = async (req, res, next) => {
  try {
    const { comment, action } = req.body; // action: 'forward' | 'reject'
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.status !== 'submitted') return res.status(400).json({ message: 'Proposal must be submitted first' });
    proposal.coordinatorReview = { reviewer: req.user._id, comment, reviewedAt: new Date() };
    proposal.status = action === 'forward' ? 'under_review' : 'rejected';
    await proposal.save();
    res.json(proposal);
  } catch (err) { next(err); }
};

// PATCH /api/proposals/:id/decision (admin/director)
exports.decideProposal = async (req, res, next) => {
  try {
    const { comment, action } = req.body; // action: 'approve' | 'reject'
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.status !== 'under_review') return res.status(400).json({ message: 'Proposal must be under review' });
    proposal.directorDecision = { decidedBy: req.user._id, comment, decidedAt: new Date() };
    proposal.status = action === 'approve' ? 'approved' : 'rejected';
    await proposal.save();

    // Auto-create project on approval
    if (action === 'approve') {
      const project = await Project.create({
        proposal: proposal._id,
        title: proposal.title,
        description: proposal.abstract,
        team: proposal.researchers,
        leadResearcher: proposal.submittedBy,
        department: proposal.department,
        status: 'planning'
      });
      await Budget.create({ project: project._id, totalBudget: proposal.estimatedBudget || 0 });
    }
    res.json(proposal);
  } catch (err) { next(err); }
};

// DELETE /api/proposals/:id
exports.deleteProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    const isOwner = proposal.submittedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });
    await proposal.deleteOne();
    res.json({ message: 'Proposal deleted' });
  } catch (err) { next(err); }
};
