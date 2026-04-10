const User = require('../models/user.model');
const Publication = require('../models/publication.model');
const Project = require('../models/project.model');
const Proposal = require('../models/proposal.model');
const Grant = require('../models/grant.model');

// GET /api/users
exports.getUsers = async (req, res, next) => {
  try {
    const { status, role, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (role) filter.role = role;
    if (department) filter.department = department;
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
};

// GET /api/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/users/:id/profile (researcher profile with stats)
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const [publications, projects, proposals, grants] = await Promise.all([
      Publication.find({ submittedBy: user._id }).populate('project', 'title').sort({ year: -1 }),
      Project.find({ team: user._id }).populate('proposal', 'title').sort({ createdAt: -1 }),
      Proposal.find({ submittedBy: user._id }).sort({ createdAt: -1 }),
      Grant.find({ applicant: user._id }).sort({ createdAt: -1 })
    ]);

    const citationAgg = await Publication.aggregate([
      { $match: { submittedBy: user._id } },
      { $group: { _id: null, total: { $sum: '$citationCount' } } }
    ]);

    res.json({
      user,
      stats: {
        totalPublications: publications.length,
        publishedCount: publications.filter(p => p.status === 'published').length,
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalProposals: proposals.length,
        approvedProposals: proposals.filter(p => p.status === 'approved').length,
        totalGrants: grants.length,
        approvedGrants: grants.filter(g => ['approved', 'active'].includes(g.status)).length,
        totalCitations: citationAgg.length > 0 ? citationAgg[0].total : 0
      },
      publications,
      projects,
      proposals,
      grants
    });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/approve
exports.approveUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User approved', user });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id/reject
exports.rejectUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User rejected', user });
  } catch (err) { next(err); }
};

// PATCH /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    const { name, department, rank, phone, bio, role, status, researchInterests, specialization, orcid, googleScholarId } = req.body;
    const isAdmin = req.user.role === 'director';
    const isSelf = req.user._id.toString() === req.params.id;
    
    if (!isAdmin && !isSelf) return res.status(403).json({ message: 'Not authorized' });
    
    const updates = { name, department, rank, phone, bio, researchInterests, specialization, orcid, googleScholarId };
    
    // Safety: Prevent admin self-lockout
    if (isAdmin && role) {
      if (isSelf && role !== 'director') {
        return res.status(400).json({ message: 'System Safeguard: You cannot change your own Administrator role.' });
      }
      updates.role = role;
    }
    
    if (isAdmin && status) {
      if (isSelf && status !== 'active') {
        return res.status(400).json({ message: 'System Safeguard: You cannot deactivate your own Administrator account.' });
      }
      updates.status = status;
    }
    
    // Remove undefined
    Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
    
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'director';
    const isSelf = req.user._id.toString() === req.params.id;

    if (!isAdmin) return res.status(403).json({ message: 'Only administrators can delete accounts.' });
    if (isSelf) return res.status(400).json({ message: 'System Safeguard: You cannot delete your own account.' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

// GET /api/users/me
exports.getMe = async (req, res) => res.json(req.user);
