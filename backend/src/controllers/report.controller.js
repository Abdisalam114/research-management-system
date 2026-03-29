const Publication = require('../models/publication.model');
const Project = require('../models/project.model');

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
      department: p.department,
      authors: (p.authorNames || []).join(', ') || p.authors.map(a => a.name).join(', ')
    }));

    if (format === 'csv') {
      const fields = ['title','type','year','journal','doi','status','citations','department','authors'];
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
