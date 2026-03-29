const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Publication = require('../models/publication.model');
const Budget = require('../models/budget.model');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    // Common aggregations
    const [
      totalUsers, pendingUsers,
      totalProposals, approvedProposals, pendingProposals,
      totalProjects, activeProjects,
      totalPublications, publishedPublications,
      budgets
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'pending' }),
      Proposal.countDocuments(role === 'researcher' ? { submittedBy: userId } : {}),
      Proposal.countDocuments(role === 'researcher' ? { submittedBy: userId, status: 'approved' } : { status: 'approved' }),
      Proposal.countDocuments(role === 'researcher' ? { submittedBy: userId, status: { $in: ['submitted','under_review'] } } : { status: { $in: ['submitted','under_review'] } }),
      Project.countDocuments(role === 'researcher' ? { team: userId } : {}),
      Project.countDocuments(role === 'researcher' ? { team: userId, status: 'active' } : { status: 'active' }),
      Publication.countDocuments(role === 'researcher' ? { submittedBy: userId } : {}),
      Publication.countDocuments(role === 'researcher' ? { submittedBy: userId, status: 'published' } : { status: 'published' }),
      Budget.find().populate('project', 'title status')
    ]);

    const totalBudget = budgets.reduce((s, b) => s + b.totalBudget, 0);
    const totalExpenses = budgets.reduce((s, b) => s + b.totalExpenses, 0);

    // Proposals by status (for chart)
    const proposalsByStatus = await Proposal.aggregate([
      ...(role === 'researcher' ? [{ $match: { submittedBy: userId } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Publications by year (for chart)
    const pubsByYear = await Publication.aggregate([
      ...(role === 'researcher' ? [{ $match: { submittedBy: userId } }] : []),
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Projects by status (for chart)
    const projectsByStatus = await Project.aggregate([
      ...(role === 'researcher' ? [{ $match: { team: userId } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      kpis: {
        totalUsers, pendingUsers,
        totalProposals, approvedProposals, pendingProposals,
        totalProjects, activeProjects,
        totalPublications, publishedPublications,
        totalBudget, totalExpenses, remainingBudget: totalBudget - totalExpenses
      },
      charts: { proposalsByStatus, pubsByYear, projectsByStatus }
    });
  } catch (err) { next(err); }
};
