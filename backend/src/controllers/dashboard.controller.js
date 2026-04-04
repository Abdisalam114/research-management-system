const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Publication = require('../models/publication.model');
const Budget = require('../models/budget.model');
const Grant = require('../models/grant.model');

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;
    const userDept = req.user.department;

    // Build role-based filters
    const proposalFilter = role === 'researcher' ? { submittedBy: userId } : 
                           role === 'coordinator' ? { department: userDept } : {};
    const projectFilter = role === 'researcher' ? { team: userId } : 
                          role === 'coordinator' ? { department: userDept } : {};
    const pubFilter = role === 'researcher' ? { submittedBy: userId } : 
                      role === 'coordinator' ? { department: userDept } : {};

    const [
      totalUsers, pendingUsers,
      totalProposals, approvedProposals, pendingProposals,
      totalProjects, activeProjects,
      totalPublications, publishedPublications,
      budgets,
      totalGrants, approvedGrants, grantFunding
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'pending' }),
      Proposal.countDocuments(proposalFilter),
      Proposal.countDocuments({ ...proposalFilter, status: 'approved' }),
      Proposal.countDocuments({ ...proposalFilter, status: { $in: ['submitted','under_review'] } }),
      Project.countDocuments(projectFilter),
      Project.countDocuments({ ...projectFilter, status: 'active' }),
      Publication.countDocuments(pubFilter),
      Publication.countDocuments({ ...pubFilter, status: 'published' }),
      Budget.find().populate('project', 'title status'),
      Grant.countDocuments(role === 'researcher' ? { applicant: userId } : {}),
      Grant.countDocuments(role === 'researcher' ? { applicant: userId, status: 'approved' } : { status: 'approved' }),
      Grant.aggregate([
        ...(role === 'researcher' ? [{ $match: { applicant: userId } }] : []),
        { $match: { status: { $in: ['approved', 'active'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalBudget = budgets.reduce((s, b) => s + b.totalBudget, 0);
    const totalExpenses = budgets.reduce((s, b) => s + b.totalExpenses, 0);
    const fundingSecured = grantFunding.length > 0 ? grantFunding[0].total : 0;
    const grantSuccessRate = totalGrants > 0 ? Math.round((approvedGrants / totalGrants) * 100) : 0;

    // Proposals by status (for chart)
    const proposalsByStatus = await Proposal.aggregate([
      ...(Object.keys(proposalFilter).length ? [{ $match: proposalFilter }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Publications by year (for chart)
    const pubsByYear = await Publication.aggregate([
      ...(Object.keys(pubFilter).length ? [{ $match: pubFilter }] : []),
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Projects by status (for chart)
    const projectsByStatus = await Project.aggregate([
      ...(Object.keys(projectFilter).length ? [{ $match: projectFilter }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Publications by department (for analytics)
    const pubsByDepartment = await Publication.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, totalCitations: { $sum: '$citationCount' } } },
      { $sort: { count: -1 } }
    ]);

    // Publications by type
    const pubsByType = await Publication.aggregate([
      ...(Object.keys(pubFilter).length ? [{ $match: pubFilter }] : []),
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Grants by status
    const grantsByStatus = await Grant.aggregate([
      ...(role === 'researcher' ? [{ $match: { applicant: userId } }] : []),
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Total citations
    const citationAgg = await Publication.aggregate([
      ...(Object.keys(pubFilter).length ? [{ $match: pubFilter }] : []),
      { $group: { _id: null, total: { $sum: '$citationCount' } } }
    ]);
    const totalCitations = citationAgg.length > 0 ? citationAgg[0].total : 0;

    // Recent activity
    const recentProposals = await Proposal.find(proposalFilter)
      .populate('submittedBy', 'name')
      .sort({ updatedAt: -1 }).limit(5);
    const recentPublications = await Publication.find(pubFilter)
      .populate('submittedBy', 'name')
      .sort({ updatedAt: -1 }).limit(5);

    res.json({
      kpis: {
        totalUsers, pendingUsers,
        totalProposals, approvedProposals, pendingProposals,
        totalProjects, activeProjects,
        totalPublications, publishedPublications,
        totalBudget, totalExpenses, remainingBudget: totalBudget - totalExpenses,
        totalGrants, approvedGrants, fundingSecured, grantSuccessRate,
        totalCitations
      },
      charts: { proposalsByStatus, pubsByYear, projectsByStatus, pubsByDepartment, pubsByType, grantsByStatus },
      recent: { recentProposals, recentPublications }
    });
  } catch (err) { next(err); }
};
