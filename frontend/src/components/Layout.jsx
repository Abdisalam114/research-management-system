import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px',
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px'
            }}>
              <div className="sidebar-avatar" style={{ width: '30px', height: '30px', fontSize: '0.75rem' }}>
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{user?.department || user?.role}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
