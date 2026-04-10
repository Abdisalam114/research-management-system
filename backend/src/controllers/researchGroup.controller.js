const ResearchGroup = require('../models/researchGroup.model');

// GET /api/research-groups
exports.getGroups = async (req, res, next) => {
  try {
    const { status, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;
    const groups = await ResearchGroup.find(filter)
      .populate('leader', 'name email department')
      .populate('projects', 'title status')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) { next(err); }
};

// GET /api/research-groups/:id
exports.getGroup = async (req, res, next) => {
  try {
    const group = await ResearchGroup.findById(req.params.id)
      .populate('leader', 'name email department')
      .populate('projects', 'title status progress')
      .populate('publications', 'title type status year')
      .populate('createdBy', 'name');
    if (!group) return res.status(404).json({ message: 'Research group not found' });
    res.json(group);
  } catch (err) { next(err); }
};

// POST /api/research-groups
exports.createGroup = async (req, res, next) => {
  try {
    const { name, description, department, researchThemes, leader, members, isInterdisciplinary } = req.body;
    const group = await ResearchGroup.create({
      name, description, department, researchThemes,
      leader: leader || req.user._id,
      members: members || [req.user._id],
      isInterdisciplinary,
      createdBy: req.user._id
    });
    res.status(201).json(group);
  } catch (err) { next(err); }
};

// PATCH /api/research-groups/:id
exports.updateGroup = async (req, res, next) => {
  try {
    const allowed = ['name', 'description', 'department', 'researchThemes', 'leader', 'members',
      'projects', 'publications', 'status', 'isInterdisciplinary'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const group = await ResearchGroup.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('leader', 'name email');
    if (!group) return res.status(404).json({ message: 'Research group not found' });
    res.json(group);
  } catch (err) { next(err); }
};

// DELETE /api/research-groups/:id
exports.deleteGroup = async (req, res, next) => {
  try {
    await ResearchGroup.findByIdAndDelete(req.params.id);
    res.json({ message: 'Research group deleted' });
  } catch (err) { next(err); }
};
