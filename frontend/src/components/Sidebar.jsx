import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Briefcase, BookOpen, 
  Wallet, PieChart, Users, Settings, LogOut, 
  DollarSign, UsersRound, User
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'coordinator', 'finance', 'researcher', 'student'] },
    { name: 'Proposals', path: '/proposals', icon: FileText, roles: ['admin', 'coordinator', 'researcher', 'student'] },
    { name: 'Projects', path: '/projects', icon: Briefcase, roles: ['admin', 'coordinator', 'finance', 'researcher', 'student'] },
    { name: 'Publications', path: '/publications', icon: BookOpen, roles: ['admin', 'coordinator', 'researcher', 'student'] },
    { name: 'Grants', path: '/grants', icon: DollarSign, roles: ['admin', 'coordinator', 'finance', 'researcher', 'student'] },
    { name: 'Budgets', path: '/budgets', icon: Wallet, roles: ['admin', 'finance', 'researcher', 'student'] },
    { name: 'Reports', path: '/reports', icon: PieChart, roles: ['admin', 'coordinator', 'finance'] },
    { name: 'Research Groups', path: '/research-groups', icon: UsersRound, roles: ['admin', 'coordinator', 'researcher', 'student'] },
    { name: 'My Profile', path: '/profile', icon: User, roles: ['researcher', 'student'] },
  ];

  const adminLinks = [
    { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
    { name: 'Settings', path: '/settings', icon: Settings, roles: ['admin'] },
  ];

  const visibleNav = navLinks.filter(l => l.roles.includes(user?.role));
  const visibleAdmin = adminLinks.filter(l => l.roles.includes(user?.role));

  const getRoleBadge = (role) => {
    const labels = { admin: 'Director', coordinator: 'Assist Director', finance: 'Finance', researcher: 'Researcher', student: 'Student' };
    return labels[role] || role;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.png" alt="Jamhuriya Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        <div>
          <div className="logo-text" style={{ fontSize: '0.9rem', lineHeight: '1.2' }}>Jamhuriya</div>
          <div className="logo-sub">Research Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Main Menu</div>
          {visibleNav.map((link) => (
            <NavLink 
              key={link.path} 
              to={link.path}
              end
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <link.icon className="nav-icon" />
              {link.name}
            </NavLink>
          ))}
        </div>

        {visibleAdmin.length > 0 && (
          <div className="nav-section">
            <div className="nav-section-label">Administration</div>
            {visibleAdmin.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path}
                end
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <link.icon className="nav-icon" />
                {link.name}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="user-name">{user?.name || 'User Name'}</div>
            <div className="user-role">{getRoleBadge(user?.role)}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
