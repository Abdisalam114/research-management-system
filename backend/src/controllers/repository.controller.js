const Repository = require('../models/repository.model');
const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Publication = require('../models/publication.model');

// GET /api/repository
exports.getItems = async (req, res, next) => {
  try {
    const { type, department, accessLevel, status, query } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (department) filter.department = department;
    if (accessLevel) filter.accessLevel = accessLevel;
    if (status) filter.status = status;
    if (query) {
      filter.$text = { $search: query };
    }

    // Role-based visibility
    if (req.user.role === 'researcher') {
      filter.$or = [
        { accessLevel: 'public' },
        { accessLevel: 'institutional' },
        { submittedBy: req.user._id }
      ];
    } else if (req.user.role === 'finance') {
      filter.type = { $in: ['proposal', 'report', 'other'] };
    }

    const items = await Repository.find(filter)
      .populate('authors', 'name email')
      .populate('submittedBy', 'name department')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { next(err); }
};

// GET /api/repository/:id
exports.getItem = async (req, res, next) => {
  try {
    const item = await Repository.findById(req.params.id)
      .populate('authors', 'name email')
      .populate('submittedBy', 'name email department')
      .populate('relatedProposal', 'title status')
      .populate('relatedProject', 'title status')
      .populate('relatedPublication', 'title status');
    
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Track views
    item.viewCount += 1;
    await item.save();

    res.json(item);
  } catch (err) { next(err); }
};

// POST /api/repository
exports.createItem = async (req, res, next) => {
  try {
    const { 
      title, description, type, authors, authorNames, department, 
      keywords, abstract, year, files, doi, isbn, language, 
      license, accessLevel, relatedProposal, relatedProject, relatedPublication 
    } = req.body;

    // Advanced Feature: DOI Auto-fetch Simulation
    let autoDoi = doi;
    if (!doi && type === 'publication' && title) {
      // In a real system, we would call a DOI API here
      // Placeholder for DOI fetching logic
      console.log(`Searching DOI for: ${title}`);
    }

    const item = await Repository.create({
      title, description, type, authors, authorNames, department,
      keywords, abstract, year, files, doi: autoDoi, isbn, language,
      license, accessLevel, relatedProposal, relatedProject, relatedPublication,
      submittedBy: req.user._id,
      status: req.user.role === 'director' ? 'approved' : 'under_review'
    });

    // Advanced Feature: Plagiarism Check Simulation
    if (['proposal', 'thesis', 'publication'].includes(type)) {
      item.plagiarismCheck = {
        status: 'pending',
        provider: 'Institutional Checker',
        checkedAt: new Date()
      };
      await item.save();
      
      // Simulate async check
      setTimeout(async () => {
        const updatedItem = await Repository.findById(item._id);
        if (updatedItem) {
          updatedItem.plagiarismCheck.status = 'passed';
          updatedItem.plagiarismCheck.score = Math.floor(Math.random() * 15); // Low score is good
          await updatedItem.save();
        }
      }, 5000);
    }

    res.status(201).json(item);
  } catch (err) { next(err); }
};

// PATCH /api/repository/:id
exports.updateItem = async (req, res, next) => {
  try {
    const item = await Repository.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const isOwner = item.submittedBy.toString() === req.user._id.toString();
    const isPrivileged = ['director', 'coordinator'].includes(req.user.role);

    if (!isOwner && !isPrivileged) return res.status(403).json({ message: 'Not authorized' });

    const allowed = [
      'title', 'description', 'type', 'authors', 'authorNames', 'department',
      'keywords', 'abstract', 'year', 'files', 'doi', 'isbn', 'language',
      'license', 'accessLevel', 'status', 'institutionalRepoUrl'
    ];

    allowed.forEach(f => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    if (req.body.status && isPrivileged) {
      item.status = req.body.status;
      if (req.body.status === 'approved') {
        item.reviewedBy = req.user._id;
        item.reviewedAt = new Date();
      }
    }

    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

// DELETE /api/repository/:id
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Repository.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const isOwner = item.submittedBy.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'director') return res.status(403).json({ message: 'Not authorized' });

    await item.deleteOne();
    res.json({ message: 'Item removed from repository' });
  } catch (err) { next(err); }
};

// GET /api/repository/stats
exports.getRepoStats = async (req, res, next) => {
  try {
    const stats = await Repository.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const downloads = await Repository.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } }
    ]);
    res.json({
      distribution: stats,
      totalDownloads: downloads.length > 0 ? downloads[0].total : 0
    });
  } catch (err) { next(err); }
};
