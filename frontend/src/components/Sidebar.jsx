import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, FileText, Briefcase, BookOpen, 
  Wallet, PieChart, Users, Settings, LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Proposals', path: '/proposals', icon: FileText },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Publications', path: '/publications', icon: BookOpen },
    { name: 'Budgets', path: '/budgets', icon: Wallet },
    { name: 'Reports', path: '/reports', icon: PieChart },
  ];

  if (user?.role === 'admin') {
    navLinks.push({ name: 'Users', path: '/users', icon: Users });
    navLinks.push({ name: 'Settings', path: '/settings', icon: Settings });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">R</div>
        <div>
          <div className="logo-text">ResearchPortal</div>
          <div className="logo-sub">Management System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Main Menu</div>
          {navLinks.map((link) => (
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
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="sidebar-user-info">
            <div className="user-name">{user?.name || 'User Name'}</div>
            <div className="user-role">{user?.role || 'user role'}</div>
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
