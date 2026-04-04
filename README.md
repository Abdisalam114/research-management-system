# Jamhuriya Research Management System (RMS)

A comprehensive, full-stack web application custom-built for university environments to manage the entire lifecycle of academic research. The system streamlines proposals, tracks project implementation, aggregates publications, manages project budgets, and maintains detailed researcher profiles.

---

## 🌟 Key Features

The platform is strictly role-based and implements an integrated 8-module approach:

### 1. Unified Dashboard
- Visual KPIs displaying running projects, pending proposals, active grants, and total citations.
- Role-scoped charting (Recharts) dynamically rendering grant success rates, publication growth over time, and budget utilization.
- Real-time recent activity action feed.

### 2. Multi-Stage Proposal Workflow
- Submit research proposals and define estimated budgets.
- Automated multi-step review pipeline: `Draft` → `Submitted` → `Under Review` → `Revision Requested` → `Approved / Rejected`.
- Integrated ethics approval tags and version tracking.

### 3. Project & Milestone Tracking
- Automatically generates active projects from approved proposals.
- Track overall completion progress (0-100%).
- Add strict, date-bound research milestones and track actionable deliverables. 

### 4. Publication Repository
- Centralized tracking for journals, conferences, book chapters, and patents.
- Admin-level verification system for newly submitted publications.
- Automated aggregated citation counting.

### 5. Grants & Budget Finance Modeling
- Dedicated module for Finance officers to approve external research grants.
- Record precise line-item expenses against approved grant budgets.
- Live-calculated remaining balance indicators.

### 6. Interdisciplinary Research Groups
- Form collaborative interdisciplinary teams across university departments.
- Group activity tracing and automated team communication mapping.

### 7. Automated Analytics & Reporting
- 5 Distinct Report Pipelines: Publications, Active Projects, Grant Financials, Budget Utilization, and Faculty Productivity.
- Inline generated table-previews.
- Automated one-click CSV Export functionality for university recordkeeping.

### 8. User Management & Registration Approvals
- Built-in multi-layered Role-Based Access Control (RBAC).
- Silent verification: users securely register and sit in a `Pending` queue until evaluated.
- **5 Core Access Roles**: 
  - **Director** *(Admin - Unrestricted)*
  - **Assist Director** *(Coordinator - Academic Approval)*
  - **Finance** *(Grant tracking and Budgets)*
  - **Researcher** *(Faculty Members)*
  - **Student** *(Final Year Undergraduates / Post-Graduates)*

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
