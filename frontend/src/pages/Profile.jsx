import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../api/services';
import { User, BookOpen, Briefcase, FileText, Award, GraduationCap, ExternalLink, Save } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (user?._id) {
      usersAPI.getProfile(user._id)
        .then(res => {
          setProfileData(res.data);
          setForm({
            name: res.data.user.name || '',
            department: res.data.user.department || '',
            rank: res.data.user.rank || '',
            phone: res.data.user.phone || '',
            bio: res.data.user.bio || '',
            specialization: res.data.user.specialization || '',
            orcid: res.data.user.orcid || '',
            googleScholarId: res.data.user.googleScholarId || '',
            researchInterests: (res.data.user.researchInterests || []).join(', ')
          });
        })
        .catch(() => toast.error('Failed to load profile'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const data = {
        ...form,
        researchInterests: form.researchInterests.split(',').map(i => i.trim()).filter(Boolean)
      };
      const res = await usersAPI.update(user._id, data);
      updateUser(res.data);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error('Error updating profile');
    }
  };

  if (loading) return <div className="splash" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}><div className="spinner"></div></div>;
  if (!profileData) return null;

  const { stats, publications, projects, proposals, grants } = profileData;

  const statCards = [
    { label: 'Publications', value: stats.totalPublications, sub: `${stats.publishedCount} published`, icon: BookOpen, color: '#3b82f6' },
    { label: 'Projects', value: stats.totalProjects, sub: `${stats.activeProjects} active`, icon: Briefcase, color: '#10b981' },
    { label: 'Proposals', value: stats.totalProposals, sub: `${stats.approvedProposals} approved`, icon: FileText, color: '#f59e0b' },
    { label: 'Grants', value: stats.totalGrants, sub: `${stats.approvedGrants} funded`, icon: Award, color: '#8b5cf6' },
    { label: 'Citations', value: stats.totalCitations, sub: 'Total citations', icon: GraduationCap, color: '#ef4444' },
  ];

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">Research Profile</h1>
        <p className="page-subtitle">Your personal research portfolio and activity summary.</p>
      </div>

      {/* Profile Header Card */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '16px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#fff',
            background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', flexShrink: 0
          }}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--text-primary)' }}>{user?.name}</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {user?.rank || user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.department || 'No department'}
                </p>
                {user?.specialization && <p style={{ margin: '2px 0 0', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{user.specialization}</p>}
              </div>
              <button className="btn btn-secondary" onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            {!editMode && user?.bio && <p style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{user.bio}</p>}
            {!editMode && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {(user?.researchInterests || []).map((i, idx) => (
                  <span key={idx} className="badge badge-approved" style={{ fontSize: '0.7rem' }}>{i}</span>
                ))}
              </div>
            )}
            {!editMode && (user?.orcid || user?.googleScholarId) && (
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                {user.orcid && <a href={`https://orcid.org/${user.orcid}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}><ExternalLink size={12} /> ORCID</a>}
                {user.googleScholarId && <a href={`https://scholar.google.com/citations?user=${user.googleScholarId}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}><ExternalLink size={12} /> Google Scholar</a>}
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        {editMode && (
          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Rank / Title</label>
                <input className="form-input" value={form.rank} onChange={e => setForm({...form, rank: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Specialization</label>
                <input className="form-input" value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">ORCID</label>
                <input className="form-input" value={form.orcid} onChange={e => setForm({...form, orcid: e.target.value})} placeholder="0000-0000-0000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Google Scholar ID</label>
                <input className="form-input" value={form.googleScholarId} onChange={e => setForm({...form, googleScholarId: e.target.value})} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Research Interests (comma-separated)</label>
                <input className="form-input" value={form.researchInterests} onChange={e => setForm({...form, researchInterests: e.target.value})} placeholder="Machine Learning, NLP, Computer Vision" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-textarea" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows={3} />
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: '12px' }}>
              <button className="btn btn-primary" onClick={handleSave}><Save size={14} /> Save Profile</button>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '20px' }}>
        {statCards.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ background: `${s.color}15`, color: s.color, padding: '10px', borderRadius: '8px', width: 'fit-content', marginBottom: '12px' }}>
              <s.icon size={22} />
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent Publications */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Recent Publications</h3>
        </div>
        {publications.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No publications yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Title</th><th>Type</th><th>Year</th><th>Status</th><th>Citations</th></tr>
              </thead>
              <tbody>
                {publications.slice(0, 10).map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><span className="badge badge-draft" style={{ background: 'var(--bg-secondary)' }}>{p.type}</span></td>
                    <td>{p.year}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>{p.citationCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Active Projects</h3>
        </div>
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No projects yet.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Title</th><th>Status</th><th>Progress</th></tr>
              </thead>
              <tbody>
                {projects.slice(0, 10).map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.progress}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{p.progress}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
