require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Publication = require('../models/publication.model');
const Budget = require('../models/budget.model');
const Department = require('../models/department.model');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Seeding database...');

  // Clear
  await Promise.all([User.deleteMany(), Proposal.deleteMany(), Project.deleteMany(), Publication.deleteMany(), Budget.deleteMany(), Department.deleteMany()]);

  // Departments
  const depts = await Department.insertMany([
    { name: 'Computer Science', code: 'CS' },
    { name: 'Biomedical Engineering', code: 'BME' },
    { name: 'Environmental Sciences', code: 'ENV' }
  ]);

  // Users (password = Password123)
  const admin = await User.create({ name: 'Dr. Admin', email: 'admin@rms.edu', password: 'Password123', role: 'admin', status: 'active', department: 'CS', rank: 'Professor' });
  const coordinator = await User.create({ name: 'Dr. Sarah Chen', email: 'coordinator@rms.edu', password: 'Password123', role: 'coordinator', status: 'active', department: 'CS', rank: 'Associate Professor' });
  const finance = await User.create({ name: 'Mr. James Okafor', email: 'finance@rms.edu', password: 'Password123', role: 'finance', status: 'active', department: 'BME', rank: 'Finance Officer' });
  const researcher = await User.create({ name: 'Dr. Aisha Musa', email: 'researcher@rms.edu', password: 'Password123', role: 'researcher', status: 'active', department: 'ENV', rank: 'Lecturer' });
  const pending = await User.create({ name: 'John Pending', email: 'pending@rms.edu', password: 'Password123', role: 'researcher', status: 'pending', department: 'CS', rank: 'PhD Student' });

  // Proposals
  const p1 = await Proposal.create({
    title: 'AI-Driven Climate Change Prediction Model',
    abstract: 'This research proposes developing a machine learning model to predict climate change impacts using satellite imagery and IoT sensor data.',
    keywords: ['AI', 'climate', 'machine learning', 'IoT'],
    researchers: [researcher._id],
    submittedBy: researcher._id,
    status: 'approved',
    estimatedBudget: 150000,
    duration: 18,
    department: 'CS',
    coordinatorReview: { reviewer: coordinator._id, comment: 'Excellent proposal, highly relevant.', reviewedAt: new Date() },
    directorDecision: { decidedBy: admin._id, comment: 'Approved with full budget.', decidedAt: new Date() }
  });

  const p2 = await Proposal.create({
    title: 'Nanotechnology for Drug Delivery Systems',
    abstract: 'Investigation of nanoparticle-based drug delivery mechanisms for targeted cancer therapy.',
    keywords: ['nanotechnology', 'drug delivery', 'cancer'],
    researchers: [researcher._id, coordinator._id],
    submittedBy: coordinator._id,
    status: 'under_review',
    estimatedBudget: 200000,
    duration: 24,
    department: 'BME',
    coordinatorReview: { reviewer: coordinator._id, comment: 'Needs budget revision.', reviewedAt: new Date() }
  });

  const p3 = await Proposal.create({
    title: 'Blockchain-Based Academic Record System',
    abstract: 'A decentralized system for secure, immutable academic record management.',
    keywords: ['blockchain', 'academic records', 'security'],
    researchers: [researcher._id],
    submittedBy: researcher._id,
    status: 'draft',
    estimatedBudget: 80000,
    duration: 12,
    department: 'CS'
  });

  // Projects (from approved proposal)
  const proj1 = await Project.create({
    proposal: p1._id,
    title: 'AI-Driven Climate Change Prediction Model',
    description: p1.abstract,
    team: [researcher._id, coordinator._id],
    leadResearcher: researcher._id,
    department: 'CS',
    status: 'active',
    progress: 45,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-07-15'),
    milestones: [
      { title: 'Literature Review', dueDate: new Date('2024-03-01'), completed: true },
      { title: 'Data Collection', dueDate: new Date('2024-06-01'), completed: true },
      { title: 'Model Development', dueDate: new Date('2024-09-01'), completed: false },
      { title: 'Testing & Validation', dueDate: new Date('2025-01-01'), completed: false },
      { title: 'Publication & Dissemination', dueDate: new Date('2025-06-01'), completed: false }
    ]
  });

  const proj2 = await Project.create({
    proposal: p1._id,
    title: 'Urban Air Quality Monitoring Network',
    description: 'Deploying IoT sensors across the city to monitor air quality in real time.',
    team: [researcher._id],
    leadResearcher: researcher._id,
    department: 'ENV',
    status: 'completed',
    progress: 100,
    startDate: new Date('2023-01-01'),
    endDate: new Date('2024-01-01'),
    milestones: [
      { title: 'Sensor Deployment', dueDate: new Date('2023-04-01'), completed: true },
      { title: 'Data Pipeline', dueDate: new Date('2023-08-01'), completed: true },
      { title: 'Final Report', dueDate: new Date('2023-12-01'), completed: true }
    ]
  });

  // Budgets
  await Budget.create({
    project: proj1._id,
    totalBudget: 150000,
    expenses: [
      { description: 'Server infrastructure setup', amount: 25000, category: 'equipment', date: new Date('2024-02-01') },
      { description: 'Research team salaries - Q1', amount: 30000, category: 'personnel', date: new Date('2024-03-31') },
      { description: 'Conference travel - IEEE', amount: 5500, category: 'travel', date: new Date('2024-04-15') },
      { description: 'Software licenses', amount: 8000, category: 'materials', date: new Date('2024-05-01') }
    ]
  });

  await Budget.create({
    project: proj2._id,
    totalBudget: 60000,
    expenses: [
      { description: 'IoT sensors purchase', amount: 20000, category: 'equipment', date: new Date('2023-02-01') },
      { description: 'Field work expenses', amount: 8500, category: 'travel', date: new Date('2023-06-01') },
      { description: 'Data analysis software', amount: 12000, category: 'materials', date: new Date('2023-07-01') }
    ]
  });

  // Publications
  await Publication.create([
    {
      project: proj2._id,
      title: 'Real-Time Urban Air Quality Assessment Using IoT Sensor Networks',
      authors: [researcher._id],
      authorNames: ['Dr. Aisha Musa', 'Dr. Sarah Chen'],
      year: 2024,
      journal: 'Environmental Science & Technology',
      doi: '10.1021/acs.est.2024.00123',
      type: 'journal',
      status: 'published',
      citationCount: 14,
      department: 'ENV',
      submittedBy: researcher._id,
      verifiedBy: admin._id,
      verifiedAt: new Date()
    },
    {
      project: proj1._id,
      title: 'Federated Learning for Privacy-Preserving Climate Prediction',
      authors: [researcher._id, coordinator._id],
      authorNames: ['Dr. Aisha Musa', 'Dr. Sarah Chen'],
      year: 2024,
      conference: 'NeurIPS 2024',
      type: 'conference',
      status: 'submitted',
      citationCount: 3,
      department: 'CS',
      submittedBy: researcher._id
    },
    {
      title: 'Machine Learning Approaches in Environmental Science',
      authors: [coordinator._id],
      authorNames: ['Dr. Sarah Chen'],
      year: 2023,
      journal: 'Nature Machine Intelligence',
      doi: '10.1038/nmi.2023.45',
      type: 'journal',
      status: 'published',
      citationCount: 42,
      department: 'CS',
      submittedBy: coordinator._id,
      verifiedBy: admin._id
    },
    {
      title: 'Blockchain Security Models for Academic Institutions',
      authors: [researcher._id],
      authorNames: ['Dr. Aisha Musa'],
      year: 2023,
      journal: 'IEEE Transactions on Information Security',
      type: 'journal',
      status: 'under_review',
      citationCount: 0,
      department: 'CS',
      submittedBy: researcher._id
    }
  ]);

  console.log('✅ Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:       admin@rms.edu       / Password123');
  console.log('  Coordinator: coordinator@rms.edu / Password123');
  console.log('  Finance:     finance@rms.edu     / Password123');
  console.log('  Researcher:  researcher@rms.edu  / Password123');
  console.log('  Pending:     pending@rms.edu     / Password123');
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
