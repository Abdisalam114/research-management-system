require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./src/config/db');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const proposalRoutes = require('./src/routes/proposal.routes');
const projectRoutes = require('./src/routes/project.routes');
const publicationRoutes = require('./src/routes/publication.routes');
const budgetRoutes = require('./src/routes/budget.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const reportRoutes = require('./src/routes/report.routes');

const { errorHandler } = require('./src/middleware/error.middleware');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 RMS Backend running on port ${PORT}`));
