import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { notificationsAPI } from '../api/services';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = () => {
    setLoading(true);
    notificationsAPI.getAll({ limit: 20 })
      .then(res => {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMarkRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id) => {
    await notificationsAPI.delete(id);
    const wasUnread = notifications.find(n => n._id === id && !n.read);
    setNotifications(prev => prev.filter(n => n._id !== id));
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const getTypeIcon = (type) => {
    const colors = {
      proposal_approved: '#10b981', proposal_rejected: '#ef4444', proposal_submitted: '#3b82f6',
      proposal_reviewed: '#f59e0b', grant_approved: '#10b981', grant_rejected: '#ef4444',
      publication_verified: '#10b981', user_approved: '#10b981', system: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative', background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
      >
        <Bell size={18} style={{ color: 'var(--text-secondary)' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px', background: 'var(--danger)',
            color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%',
            width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 2s infinite'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '48px', right: 0, width: '380px', maxHeight: '480px',
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 1000,
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderBottom: '1px solid var(--border)'
          }}>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Notifications</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} title="Mark all as read"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCheck size={14} /> Read all
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={16} />
              </button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Bell size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} style={{
                  display: 'flex', gap: '12px', padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  background: n.read ? 'transparent' : 'rgba(59,130,246,0.04)', cursor: 'pointer', transition: 'background 0.15s'
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(59,130,246,0.04)'}
                  onClick={() => { if (!n.read) handleMarkRead(n._id); if (n.link) window.location.hash = n.link; }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', marginTop: '6px', flexShrink: 0,
                    background: n.read ? 'transparent' : getTypeIcon(n.type)
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{n.message}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>{timeAgo(n.createdAt)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                    {!n.read && (
                      <button onClick={e => { e.stopPropagation(); handleMarkRead(n._id); }} title="Mark as read"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}>
                        <Check size={14} />
                      </button>
                    )}
                    <button onClick={e => { e.stopPropagation(); handleDelete(n._id); }} title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '2px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
