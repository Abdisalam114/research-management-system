import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { researchGroupsAPI, usersAPI } from '../api/services';
import { Users as UsersIcon, Plus, Search, X, Eye, Globe } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function ResearchGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [form, setForm] = useState({
    name: '', description: '', faculty: '', department: '', researchThemes: '',
    members: [], isInterdisciplinary: false
  });
  const [studentForm, setStudentForm] = useState({
    studentId: '', studentName: '', faculty: '', department: '', className: ''
  });

  const fetchGroups = () => {
    setLoading(true);
    researchGroupsAPI.getAll()
      .then(res => setGroups(res.data))
      .catch(() => toast.error('Failed to load research groups'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);
  useEffect(() => {
    if (showModal) usersAPI.getAll({ status: 'active' }).then(r => setAllUsers(r.data)).catch(() => {});
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await researchGroupsAPI.create({
        ...form,
        researchThemes: form.researchThemes.split(',').map(t => t.trim()).filter(Boolean),
        leader: user._id
      });
      toast.success('Research group created!');
      setShowModal(false);
      setForm({ name: '', description: '', faculty: '', department: '', researchThemes: '', members: [], isInterdisciplinary: false });
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating group');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this research group?')) return;
    try {
      await researchGroupsAPI.delete(id);
      toast.success('Group deleted');
      fetchGroups();
    } catch (err) { toast.error('Error deleting group'); }
  };

  const addStudent = () => {
    if(!studentForm.studentId || !studentForm.studentName) return toast.error('Student ID and Name are required');
    setForm(prev => ({ ...prev, members: [...prev.members, studentForm] }));
    setStudentForm({ studentId: '', studentName: '', faculty: '', department: '', className: '' });
  };

  const removeStudent = (index) => {
    setForm(prev => ({ ...prev, members: prev.members.filter((_, i) => i !== index) }));
  };

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.department && g.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Research Groups</h1>
          <p className="page-subtitle">Manage research collaboration groups and inter-faculty partnerships.</p>
        </div>
        {['director', 'coordinator'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Group
          </button>
        )}
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="filters-bar">
          <div className="search-input">
            <Search className="search-icon" />
            <input type="text" className="form-input" placeholder="Search groups..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <UsersIcon className="empty-icon" />
            <div className="empty-title">No research groups found</div>
            <p>Create a group to start collaborating.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {filtered.map(g => (
            <div key={g._id} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              onClick={() => setShowDetail(g)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 className="card-title" style={{ margin: 0 }}>{g.name}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g.department || 'No department'}</span>
                </div>
                {g.isInterdisciplinary && (
                  <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}><Globe size={10} style={{ marginRight: '4px' }} /> Interdisciplinary</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
                {g.description ? (g.description.length > 100 ? g.description.slice(0, 100) + '...' : g.description) : 'No description'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {(g.researchThemes || []).slice(0, 3).map((t, i) => (
                  <span key={i} className="badge badge-draft" style={{ background: 'var(--bg-secondary)', fontSize: '0.7rem' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="sidebar-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>{g.leader?.name?.charAt(0) || '?'}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{g.leader?.name || 'Unknown'}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{g.members?.length || 0} members</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Research Group</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Group Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Faculty</label>
                  <input className="form-input" value={form.faculty} onChange={e => setForm({...form, faculty: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Research Themes (comma-separated)</label>
                  <input className="form-input" value={form.researchThemes} onChange={e => setForm({...form, researchThemes: e.target.value})} placeholder="AI, Healthcare, IoT" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isInterdisciplinary} onChange={e => setForm({...form, isInterdisciplinary: e.target.checked})} />
                    <span className="form-label" style={{ margin: 0 }}>Interdisciplinary Group</span>
                  </label>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Student Members</label>
                  <div style={{ padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input className="form-input form-input-sm" placeholder="Student ID *" value={studentForm.studentId} onChange={e => setStudentForm({...studentForm, studentId: e.target.value})} />
                      <input className="form-input form-input-sm" placeholder="Student Name *" value={studentForm.studentName} onChange={e => setStudentForm({...studentForm, studentName: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <input className="form-input form-input-sm" placeholder="Faculty" value={studentForm.faculty} onChange={e => setStudentForm({...studentForm, faculty: e.target.value})} />
                      <input className="form-input form-input-sm" placeholder="Department" value={studentForm.department} onChange={e => setStudentForm({...studentForm, department: e.target.value})} />
                      <input className="form-input form-input-sm" placeholder="Class" value={studentForm.className} onChange={e => setStudentForm({...studentForm, className: e.target.value})} />
                    </div>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={addStudent} style={{ width: '100%', justifyContent: 'center' }}>+ Add Student</button>
                  </div>
                  
                  {form.members.length > 0 && (
                    <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}>
                      {form.members.map((m, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.studentName}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>{m.studentId} | {m.className}</span>
                          </div>
                          <button type="button" className="btn btn-icon" style={{ color: 'var(--danger)' }} onClick={() => removeStudent(index)}><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{showDetail.name}</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>FACULTY</strong>
                <p>{showDetail.faculty || '-'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DEPARTMENT</strong>
                <p>{showDetail.department || '-'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DESCRIPTION</strong>
                <p style={{ fontSize: '0.875rem' }}>{showDetail.description || 'No description'}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>LEADER</strong>
                <p>{showDetail.leader?.name} ({showDetail.leader?.email})</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>RESEARCH THEMES</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {(showDetail.researchThemes || []).map((t, i) => (
                    <span key={i} className="badge badge-approved">{t}</span>
                  ))}
                  {(!showDetail.researchThemes || showDetail.researchThemes.length === 0) && <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>None defined</span>}
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>STUDENT MEMBERS ({showDetail.members?.length || 0})</strong>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(showDetail.members || []).map((m, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="sidebar-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>{m.studentName?.charAt(0) || 'S'}</div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{m.studentName} ({m.studentId})</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{m.faculty || '-'} / {m.department || '-'} / {m.className || '-'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {showDetail.projects?.length > 0 && (
                <div>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>LINKED PROJECTS</strong>
                  {showDetail.projects.map(p => (
                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{p.title}</span>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {user?.role === 'director' && (
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn-danger" onClick={() => { handleDelete(showDetail._id); setShowDetail(null); }}>Delete Group</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
