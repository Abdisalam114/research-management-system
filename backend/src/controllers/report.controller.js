const Publication = require('../models/publication.model');
const Project = require('../models/project.model');
const Grant = require('../models/grant.model');
const Budget = require('../models/budget.model');
const User = require('../models/user.model');

// GET /api/reports/publications
exports.getPublicationsReport = async (req, res, next) => {
  try {
    const { department, year, status, format } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (year) filter.year = Number(year);
    if (status) filter.status = status;
    const publications = await Publication.find(filter)
      .populate('authors', 'name')
      .populate('submittedBy', 'name department')
      .sort({ year: -1 });

    const data = publications.map(p => ({
      title: p.title,
      type: p.type,
      year: p.year,
      journal: p.journal || p.conference || '-',
      doi: p.doi || '-',
      status: p.status,
      citations: p.citationCount,
      impactFactor: p.impactFactor || 0,
      department: p.department,
      authors: (p.authorNames || []).join(', ') || p.authors.map(a => a.name).join(', ')
    }));

    if (format === 'csv') {
      const fields = ['title','type','year','journal','doi','status','citations','impactFactor','department','authors'];
      const csvRows = [fields.join(','), ...data.map(r => fields.map(f => `"${(r[f] || '').toString().replace(/"/g, '""')}"`).join(','))];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=publications.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/reports/projects
exports.getProjectsReport = async (req, res, next) => {
  try {
    const { department, status, format } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    const projects = await Project.find(filter)
      .populate('leadResearcher', 'name')
      .populate('team', 'name')
      .sort({ createdAt: -1 });

    const data = projects.map(p => ({
      title: p.title,
      status: p.status,
      department: p.department,
      progress: `${p.progress}%`,
      lead: p.leadResearcher?.name || '-',
      team: p.team.map(m => m.name).join(', '),
      startDate: p.startDate ? new Date(p.startDate).toLocaleDateString() : '-',
      endDate: p.endDate ? new Date(p.endDate).toLocaleDateString() : '-',
      milestones: `${p.milestones.filter(m => m.completed).length}/${p.milestones.length}`
    }));

    if (format === 'csv') {
      const fields = ['title','status','department','progress','lead','team','startDate','endDate','milestones'];
      const csvRows = [fields.join(','), ...data.map(r => fields.map(f => `"${(r[f] || '').toString().replace(/"/g, '""')}"`).join(','))];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=projects.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/reports/grants
exports.getGrantsReport = async (req, res, next) => {
  try {
    const { department, status, type, format } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (type) filter.type = type;
    const grants = await Grant.find(filter)
      .populate('applicant', 'name department')
      .sort({ createdAt: -1 });

    const data = grants.map(g => ({
      title: g.title,
      type: g.type,
      fundingSource: g.fundingSource || g.fundingAgency || '-',
      amount: g.amount,
      status: g.status,
      department: g.department,
      applicant: g.applicant?.name || '-',
      startDate: g.startDate ? new Date(g.startDate).toLocaleDateString() : '-',
      endDate: g.endDate ? new Date(g.endDate).toLocaleDateString() : '-'
    }));

    if (format === 'csv') {
      const fields = ['title','type','fundingSource','amount','status','department','applicant','startDate','endDate'];
      const csvRows = [fields.join(','), ...data.map(r => fields.map(f => `"${(r[f] || '').toString().replace(/"/g, '""')}"`).join(','))];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=grants.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/reports/budget-utilization
exports.getBudgetUtilizationReport = async (req, res, next) => {
  try {
    const { format } = req.query;
    const budgets = await Budget.find()
      .populate('project', 'title status department');

    const data = budgets.map(b => ({
      project: b.project?.title || 'Unknown',
      department: b.project?.department || '-',
      projectStatus: b.project?.status || '-',
      totalBudget: b.totalBudget,
      totalExpenses: b.totalExpenses,
      remainingBalance: b.remainingBalance,
      utilization: b.totalBudget > 0 ? `${Math.round((b.totalExpenses / b.totalBudget) * 100)}%` : '0%',
      expenseCount: b.expenses.length
    }));

    if (format === 'csv') {
      const fields = ['project','department','projectStatus','totalBudget','totalExpenses','remainingBalance','utilization','expenseCount'];
      const csvRows = [fields.join(','), ...data.map(r => fields.map(f => `"${(r[f] || '').toString().replace(/"/g, '""')}"`).join(','))];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=budget_utilization.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json(data);
  } catch (err) { next(err); }
};

// GET /api/reports/faculty-productivity
exports.getFacultyProductivityReport = async (req, res, next) => {
  try {
    const { format } = req.query;
    const researchers = await User.find({ role: 'researcher', status: 'active' });
    
    const data = await Promise.all(researchers.map(async (r) => {
      const pubCount = await Publication.countDocuments({ submittedBy: r._id });
      const publishedCount = await Publication.countDocuments({ submittedBy: r._id, status: 'published' });
      const projectCount = await Project.countDocuments({ team: r._id });
      const proposalCount = await Proposal.countDocuments({ submittedBy: r._id });
      const grantCount = await Grant.countDocuments({ applicant: r._id, status: { $in: ['approved', 'active'] } });
      const citationAgg = await Publication.aggregate([
        { $match: { submittedBy: r._id } },
        { $group: { _id: null, total: { $sum: '$citationCount' } } }
      ]);
      return {
        name: r.name,
        department: r.department || '-',
        rank: r.rank || '-',
        publications: pubCount,
        published: publishedCount,
        projects: projectCount,
        proposals: proposalCount,
        grants: grantCount,
        citations: citationAgg.length > 0 ? citationAgg[0].total : 0
      };
    }));

    if (format === 'csv') {
      const fields = ['name','department','rank','publications','published','projects','proposals','grants','citations'];
      const csvRows = [fields.join(','), ...data.map(r => fields.map(f => `"${(r[f] || '').toString().replace(/"/g, '""')}"`).join(','))];
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=faculty_productivity.csv');
      return res.send(csvRows.join('\n'));
    }

    res.json(data);
  } catch (err) { next(err); }
};

// Need Proposal model for faculty productivity
const Proposal = require('../models/proposal.model');
