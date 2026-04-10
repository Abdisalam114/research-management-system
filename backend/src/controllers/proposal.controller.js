const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Budget = require('../models/budget.model');
const User = require('../models/user.model');
const { createNotification } = require('./notification.controller');

// GET /api/proposals
exports.getProposals = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (req.user.role === 'researcher') filter.submittedBy = req.user._id;
    if (req.user.role === 'coordinator') filter.department = req.user.department;
    const proposals = await Proposal.find(filter)
      .populate('submittedBy', 'name email department')
      .populate('researchers', 'name email')
      .populate('assignedReviewer', 'name email')
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
      .populate('directorDecision.decidedBy', 'name')
      .populate('assignedReviewer', 'name email')
      .populate('ethicsApproval.approvedBy', 'name');
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    res.json(proposal);
  } catch (err) { next(err); }
};

// POST /api/proposals
exports.createProposal = async (req, res, next) => {
  try {
    const { title, abstract, keywords, researchers, estimatedBudget, duration, department, ethicsRequired, documents } = req.body;
    const proposal = await Proposal.create({
      title, abstract, keywords, researchers, estimatedBudget, duration, department, documents,
      submittedBy: req.user._id, status: 'draft',
      ethicsApproval: { required: ethicsRequired || false, status: ethicsRequired ? 'pending' : 'not_required' },
      versions: [{ versionNumber: 1, title, abstract, savedBy: req.user._id }],
      currentVersion: 1
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
    if (!isOwner && req.user.role !== 'director') return res.status(403).json({ message: 'Not authorized' });
    if (!['draft', 'rejected', 'revision_requested'].includes(proposal.status)) return res.status(400).json({ message: 'Proposal cannot be edited in current status' });
    
    const allowed = ['title', 'abstract', 'keywords', 'researchers', 'estimatedBudget', 'duration', 'department', 'documents'];
    allowed.forEach(f => { if (req.body[f] !== undefined) proposal[f] = req.body[f]; });
    
    if (req.body.submit) {
      proposal.status = 'submitted';
      // Save version
      proposal.currentVersion += 1;
      proposal.versions.push({
        versionNumber: proposal.currentVersion,
        title: proposal.title,
        abstract: proposal.abstract,
        changes: req.body.changeNotes || '',
        savedBy: req.user._id
      });
      // Notify coordinators
      const coordinators = await User.find({ role: 'coordinator', department: proposal.department, status: 'active' });
      for (const coord of coordinators) {
        await createNotification({
          recipient: coord._id,
          type: 'proposal_submitted',
          title: 'New Proposal Submitted',
          message: `"${proposal.title}" has been submitted for review.`,
          link: '/proposals',
          relatedModel: 'Proposal',
          relatedId: proposal._id
        });
      }
    }
    await proposal.save();
    res.json(proposal);
  } catch (err) { next(err); }
};

// PATCH /api/proposals/:id/assign-reviewer (admin/director)
exports.assignReviewer = async (req, res, next) => {
  try {
    const { reviewerId } = req.body;
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    proposal.assignedReviewer = reviewerId;
    await proposal.save();
    // Notify the assigned reviewer
    await createNotification({
      recipient: reviewerId,
      type: 'proposal_submitted',
      title: 'Review Assignment',
      message: `You have been assigned to review proposal "${proposal.title}".`,
      link: '/proposals',
      relatedModel: 'Proposal',
      relatedId: proposal._id
    });
    res.json(proposal);
  } catch (err) { next(err); }
};

// PATCH /api/proposals/:id/review (coordinator)
exports.reviewProposal = async (req, res, next) => {
  try {
    const { comment, action } = req.body; // action: 'forward' | 'reject' | 'revision'
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    if (proposal.status !== 'submitted') return res.status(400).json({ message: 'Proposal must be submitted first' });
    proposal.coordinatorReview = { reviewer: req.user._id, comment, reviewedAt: new Date() };
    if (action === 'forward') proposal.status = 'under_review';
    else if (action === 'revision') proposal.status = 'revision_requested';
    else proposal.status = 'rejected';
    await proposal.save();

    const notifType = action === 'forward' ? 'proposal_reviewed' : action === 'revision' ? 'proposal_reviewed' : 'proposal_rejected';
    await createNotification({
      recipient: proposal.submittedBy,
      type: notifType,
      title: action === 'forward' ? 'Proposal Forwarded' : action === 'revision' ? 'Revision Requested' : 'Proposal Rejected',
      message: `Your proposal "${proposal.title}" has been ${action === 'forward' ? 'forwarded for director review' : action === 'revision' ? 'sent back for revision' : 'rejected'}.${comment ? ' Comment: ' + comment : ''}`,
      link: '/proposals',
      relatedModel: 'Proposal',
      relatedId: proposal._id
    });

    res.json(proposal);
  } catch (err) { next(err); }
};

// PATCH /api/proposals/:id/ethics (admin)
exports.updateEthics = async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    proposal.ethicsApproval.status = status;
    proposal.ethicsApproval.comment = comment || '';
    if (status === 'approved') {
      proposal.ethicsApproval.approvedBy = req.user._id;
      proposal.ethicsApproval.approvedAt = new Date();
    }
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

    await createNotification({
      recipient: proposal.submittedBy,
      type: action === 'approve' ? 'proposal_approved' : 'proposal_rejected',
      title: `Proposal ${action === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your proposal "${proposal.title}" has been ${action === 'approve' ? 'approved. A project has been created.' : 'rejected.'} ${comment ? 'Comment: ' + comment : ''}`,
      link: action === 'approve' ? '/projects' : '/proposals',
      relatedModel: 'Proposal',
      relatedId: proposal._id
    });

    res.json(proposal);
  } catch (err) { next(err); }
};

// DELETE /api/proposals/:id
exports.deleteProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    const isOwner = proposal.submittedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'director') return res.status(403).json({ message: 'Not authorized' });
    await proposal.deleteOne();
    res.json({ message: 'Proposal deleted' });
  } catch (err) { next(err); }
};
