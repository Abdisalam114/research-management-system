const Project = require('../models/project.model');

// GET /api/projects
exports.getProjects = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (req.user.role === 'researcher') filter.team = req.user._id;
    const projects = await Project.find(filter)
      .populate('team', 'name email')
      .populate('leadResearcher', 'name email')
      .populate('proposal', 'title')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { next(err); }
};

// GET /api/projects/:id
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('team', 'name email role')
      .populate('leadResearcher', 'name email')
      .populate('proposal');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

// PATCH /api/projects/:id
exports.updateProject = async (req, res, next) => {
  try {
    const allowed = ['status', 'startDate', 'endDate', 'milestones', 'progress', 'description', 'team'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const project = await Project.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('team', 'name email')
      .populate('leadResearcher', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { next(err); }
};

// PATCH /api/projects/:id/milestone/:milestoneId
exports.toggleMilestone = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const milestone = project.milestones.id(req.params.milestoneId);
    if (!milestone) return res.status(404).json({ message: 'Milestone not found' });
    milestone.completed = !milestone.completed;
    const completed = project.milestones.filter(m => m.completed).length;
    project.progress = Math.round((completed / project.milestones.length) * 100);
    await project.save();
    res.json(project);
  } catch (err) { next(err); }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
};
