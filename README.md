# Jamhuriya Research Management System (RMS)

A comprehensive, full-stack web application custom-built for university environments to manage the entire lifecycle of academic research. The system streamlines proposals, tracks project implementation, aggregates publications, manages project budgets, and maintains detailed researcher profiles.

---

## 🌟 Key Features

The platform is strictly role-based and implements an integrated 8-module approach:

### 1. Research Proposal Management
- Proposal submission
- Ethics approval workflow
- Proposal review
- Version control
- Proposal status tracking

### 2. Research Project Management
- Approved project registry
- Project timeline tracking
- Milestones monitoring
- Research team management

### 3. Grant & Funding Management
- Grant application
- Budget planning
- Funding source tracking
- Grant compliance

### 4. Publication & Output Tracking
- Journal articles
- Conference papers
- Books / book chapters
- Patents
- Community research impact

### 5. Research Repository
- Store: proposals, datasets, publications, theses
- Integration with institutional repository

### 6. Finance & Budget Tracking
- Research budget allocation
- Expense tracking
- Financial reports
- Procurement for research

### 7. Research Analytics & Reporting
- Publications per faculty
- Research productivity
- Citation metrics
- Grant success rate
- Annual research reports

### 8. Collaboration & Communication
- Inter-faculty collaboration
- Research groups
- Notifications
- Messaging system

---

### 👥 User Roles & Access

- **Research Director:** Oversees all research activities, creates strategic priorities, manages funding oversight, and generates institutional reports.
- **Faculty Research Coordinator:** Validates publications, pre-reviews faculty proposals, and coordinates research activities per department.
- **Finance Officer:** Manages budgets, grant financial tracking, handles payment workflows, and monitors compliance.
- **Researcher:** Faculty and post-graduate students capable of applying for grants, publishing datasets, tracking profile impact, and managing timelines.

### 🛡️ System Security & Safeguards
To ensure robust institutional management and prevent accidental lockouts, the system includes:
- **Lockout Prevention:** Administrators are strictly prohibited from deactivating their own accounts or changing their own roles.
- **Protected Deletion:** Administrators cannot delete their own profiles.
- **Backend Enforcement:** Identity-aware middleware and controller-level logic enforce these rules via the API.
- **Identity Integrity:** Role-based access control (RBAC) ensures users only access modules assigned to their ranks.

---

## 🛠️ Technology Stack

**Frontend Architecture (React)**
- React 18 (Vite Bundler)
- React Router DOM (Role Protected Routing)
- Context API (JWT Session Management)
- Recharts (Data Visualization)
- Lucide React (Iconography)
- Vanilla CSS3 (Custom Responsive Component System)

**Backend Architecture (Node.js)**
- Express.js (REST API Server)
- MongoDB & Mongoose (NoSQL Schemas)
- JWT (JSON Web Tokens) for Authentication
- Bcrypt (Password Hashing)
- CORS & Express Error Handlers

---

## 🚀 Installation & Local Development

### 1. Prerequisites
Ensure you have the following installed on your machine:
- Node.js (v16.14.0 or higher)
- MongoDB Server running locally on port 27017

### 2. Backend Setup
Navigate into the backend directory, install dependencies, and start the development server.

```bash
cd backend
npm install
npm run dev
```

*Note: The backend runs natively on `http://localhost:5000`.*

### 3. Frontend Setup
Open a second terminal, navigate into the frontend directory, install dependencies, and boot Vite.

```bash
cd frontend
npm install
npm run dev
```

*Note: The React development server natively runs on `http://localhost:5173`.*

---

## 🔑 Default Seed Administration

A master director-level account is seeded automatically to gain initial entry to the dashboard so you can safely approve newly registered test accounts.

- **Email:** `admin@rms.edu`
- **Password:** `admin123`

---

## 📂 Folder Structure

```text
research-management-system/
├── backend/
│   ├── src/
│   │   ├── config/       # MongoDB connections
│   │   ├── controllers/  # API business logic
│   │   ├── middleware/   # JWT verification & RBAC auth
│   │   ├── models/       # Mongoose Schemas (User, Project, Grant, etc.)
│   │   ├── routes/       # Express route handlers
│   │   └── utils/        # Error tracking & Admin seeding
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/          # Axios interceptors and endpoints 
    │   ├── components/   # System Sidebar, Navbar, Badges
    │   ├── context/      # Auth state 
    │   ├── pages/        # Dashboard, Users, Projects, Publications...
    │   ├── routes/       # Protected routing logic
    │   └── App.jsx       # Root router component
    ├── index.css         # Global Theme Definitions
    └── package.json
```
