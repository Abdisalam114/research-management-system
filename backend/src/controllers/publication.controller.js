const Publication = require('../models/publication.model');

// GET /api/publications
exports.getPublications = async (req, res, next) => {
  try {
    const { status, type, year, department } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (year) filter.year = Number(year);
    if (department) filter.department = department;
    if (req.user.role === 'researcher') filter.submittedBy = req.user._id;
    const publications = await Publication.find(filter)
      .populate('authors', 'name email')
      .populate('submittedBy', 'name email')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.json(publications);
  } catch (err) { next(err); }
};

// GET /api/publications/:id
exports.getPublication = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id)
      .populate('authors', 'name email')
      .populate('submittedBy', 'name')
      .populate('verifiedBy', 'name')
      .populate('project', 'title');
    if (!pub) return res.status(404).json({ message: 'Publication not found' });
    res.json(pub);
  } catch (err) { next(err); }
};

// POST /api/publications
exports.createPublication = async (req, res, next) => {
  try {
    const { title, authors, authorNames, year, journal, conference, doi, abstract, keywords, type, project, department } = req.body;
    
    // Advanced Feature: DOI Fetching simulation
    let resolvedDoi = doi;
    if (!doi && title) {
      // Simulate calling CrossRef or similar API
      console.log(`[Advanced Feature] Attempting DOI resolution for: ${title}`);
      // resolvedDoi = "10.1000/resolved-placeholder";
    }

    const pub = await Publication.create({
      title, authors, authorNames, year, journal, conference, doi: resolvedDoi, abstract, keywords, type, project, department,
      submittedBy: req.user._id, status: 'draft'
    });
    res.status(201).json(pub);
  } catch (err) { next(err); }
};

// PATCH /api/publications/:id
exports.updatePublication = async (req, res, next) => {
  try {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: 'Publication not found' });
    const isOwner = pub.submittedBy.toString() === req.user._id.toString();
    if (!isOwner && !['director', 'coordinator'].includes(req.user.role)) return res.status(403).json({ message: 'Not authorized' });
    const allowed = ['title', 'authors', 'authorNames', 'year', 'journal', 'conference', 'doi', 'abstract', 'keywords', 'type', 'status', 'citationCount', 'department'];
    allowed.forEach(f => { if (req.body[f] !== undefined) pub[f] = req.body[f]; });
    await pub.save();
    res.json(pub);
  } catch (err) { next(err); }
};

// PATCH /api/publications/:id/verify
exports.verifyPublication = async (req, res, next) => {
  try {
    const pub = await Publication.findByIdAndUpdate(req.params.id, {
      status: 'published',
      verifiedBy: req.user._id,
      verifiedAt: new Date()
    }, { new: true });
    if (!pub) return res.status(404).json({ message: 'Publication not found' });
    res.json(pub);
  } catch (err) { next(err); }
};

// DELETE /api/publications/:id
exports.deletePublication = async (req, res, next) => {
  try {
    await Publication.findByIdAndDelete(req.params.id);
    res.json({ message: 'Publication deleted' });
  } catch (err) { next(err); }
};
