require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Proposal = require('../models/proposal.model');
const Project = require('../models/project.model');
const Publication = require('../models/publication.model');
const Budget = require('../models/budget.model');
const Department = require('../models/department.model');

const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Seeding database with 7 years of data...');

  // Clear
  await Promise.all([User.deleteMany(), Proposal.deleteMany(), Project.deleteMany(), Publication.deleteMany(), Budget.deleteMany(), Department.deleteMany()]);

  // Departments
  const depts = await Department.insertMany([
    { name: 'Computer Science', code: 'CS' },
    { name: 'Biomedical Engineering', code: 'BME' },
    { name: 'Environmental Sciences', code: 'ENV' },
    { name: 'Social Sciences', code: 'SOC' },
    { name: 'Economics', code: 'ECON' }
  ]);

  // Users (password = Password123)
  const admin = await User.create({ name: 'Dr. Admin', email: 'admin@rms.edu', password: 'Password123', role: 'director', status: 'active', department: 'CS', rank: 'Professor' });
  const coordinator = await User.create({ name: 'Dr. Sarah Chen', email: 'coordinator@rms.edu', password: 'Password123', role: 'coordinator', status: 'active', department: 'CS', rank: 'Associate Professor' });
  const finance = await User.create({ name: 'Mr. James Okafor', email: 'finance@rms.edu', password: 'Password123', role: 'finance', status: 'active', department: 'BME', rank: 'Finance Officer' });
  const researcher = await User.create({ name: 'Dr. Aisha Musa', email: 'researcher@rms.edu', password: 'Password123', role: 'researcher', status: 'active', department: 'ENV', rank: 'Lecturer' });
  
  const researchers = [researcher];
  for(let i=1; i<=10; i++) {
    const r = await User.create({ 
      name: `Researcher ${i}`, 
      email: `researcher${i}@rms.edu`, 
      password: 'Password123', 
      role: 'researcher', 
      status: 'active', 
      department: depts[i % depts.length].code, 
      rank: i % 2 === 0 ? 'Senior Lecturer' : 'Assistant Professor' 
    });
    researchers.push(r);
  }

  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  
  console.log('📦 Creating Proposals, Projects, Budgets, and Publications...');

  for (const year of years) {
    const numItems = Math.floor(Math.random() * 5) + 3; // 3 to 7 items per year
    
    for (let i = 0; i < numItems; i++) {
      const dept = depts[Math.floor(Math.random() * depts.length)];
      const lead = researchers[Math.floor(Math.random() * researchers.length)];
      
      const proposal = await Proposal.create({
        title: `Research Study ${year}-${i}: ${dept.name} Innovation`,
        abstract: `This multi-year study starting in ${year} explores advanced concepts in ${dept.name} with a focus on sustainable development.`,
        keywords: [dept.code, 'Innovation', 'Research', year.toString()],
        researchers: [lead._id],
        submittedBy: lead._id,
        status: year < 2026 ? 'approved' : 'under_review',
        estimatedBudget: Math.floor(Math.random() * 400000) + 50000,
        duration: Math.floor(Math.random() * 24) + 12,
        department: dept.code,
        directorDecision: { decidedBy: admin._id, comment: 'Strategic alignment approved.', decidedAt: new Date(year, 0, 1) }
      });

      if (year < 2026) {
        const status = year < 2024 ? 'completed' : 'active';
        const project = await Project.create({
          proposal: proposal._id,
          title: proposal.title,
          description: proposal.abstract,
          team: [lead._id],
          leadResearcher: lead._id,
          department: dept.code,
          status: status,
          progress: status === 'completed' ? 100 : Math.floor(Math.random() * 90),
          startDate: new Date(year, Math.floor(Math.random() * 12), 1),
          endDate: new Date(year + 2, Math.floor(Math.random() * 12), 1)
        });

        // Budget
        await Budget.create({
          project: project._id,
          totalBudget: proposal.estimatedBudget,
          expenses: [
            { description: 'Initial Equipment', amount: proposal.estimatedBudget * 0.3, category: 'equipment', date: project.startDate },
            { description: 'Personnel Costs', amount: proposal.estimatedBudget * 0.4, category: 'personnel', date: randomDate(project.startDate, project.endDate) }
          ]
        });

        // Publications
        if (year < 2025) {
          const numPubs = Math.floor(Math.random() * 2) + 1;
          for (let j = 0; j < numPubs; j++) {
            await Publication.create({
              project: project._id,
              title: `Scientific Findings from ${project.title} - Vol ${j+1}`,
              authors: [lead._id],
              authorNames: [lead.name],
              year: year + 1,
              journal: year % 2 === 0 ? 'International Journal of Science' : 'Nature Research',
              type: 'journal',
              status: 'published',
              citationCount: Math.floor(Math.random() * 100),
              department: dept.code,
              submittedBy: lead._id,
              verifiedBy: admin._id,
              verifiedAt: new Date()
            });
          }
        }
      }
    }
  }

  console.log('✅ Seed complete with 7 years of history!');
  console.log('\n📋 Login credentials (same as before):');
  console.log('  Admin:       admin@rms.edu       / Password123');
  console.log('  Researcher:  researcher@rms.edu  / Password123');
  
  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
