import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { grantsAPI, usersAPI } from '../api/services';
import { DollarSign, Plus, Search, X, Eye, Check, XCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Grants() {
  const { user } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [researchers, setResearchers] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', type: 'internal', fundingSource: '', fundingAgency: '',
    amount: '', startDate: '', endDate: '', department: user?.department || '',
    coInvestigators: [], budgetBreakdown: { personnel: 0, equipment: 0, travel: 0, materials: 0, overhead: 0, other: 0 }
  });

  const fetchGrants = () => {
    setLoading(true);
    grantsAPI.getAll({ type: filterType || undefined })
      .then(res => setGrants(res.data))
      .catch(() => toast.error('Failed to load grants'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGrants(); }, [filterType]);
  useEffect(() => {
    if (showModal) usersAPI.getAll({ status: 'active', role: 'researcher' }).then(r => setResearchers(r.data)).catch(() => {});
  }, [showModal]);

  const handleSubmit = async (e, asDraft = true) => {
    e.preventDefault();
    try {
      const data = { ...form, amount: Number(form.amount), submit: !asDraft };
      await grantsAPI.create(data);
      toast.success(asDraft ? 'Grant saved as draft' : 'Grant submitted!');
      setShowModal(false);
      setForm({ title: '', description: '', type: 'internal', fundingSource: '', fundingAgency: '', amount: '', startDate: '', endDate: '', department: user?.department || '', coInvestigators: [], budgetBreakdown: { personnel: 0, equipment: 0, travel: 0, materials: 0, overhead: 0, other: 0 } });
      fetchGrants();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating grant');
    }
  };

  const handleReview = async (id, action) => {
    const comment = action === 'reject' ? window.prompt('Reason for rejection:') : '';
    if (action === 'reject' && comment === null) return;
    try {
      await grantsAPI.review(id, { action, comment });
      toast.success(`Grant ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchGrants();
      setShowDetail(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error reviewing grant');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this grant application?')) return;
    try {
      await grantsAPI.delete(id);
      toast.success('Grant deleted');
      fetchGrants();
    } catch (err) {
      toast.error('Error deleting grant');
    }
  };

  const getStatusBadge = (status) => <span className={`badge badge-${status}`}>{(status || '').replace('_', ' ').toUpperCase()}</span>;

  const filtered = grants.filter(g =>
    g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.department && g.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (g.fundingSource && g.fundingSource.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalFunding = grants.filter(g => ['approved', 'active'].includes(g.status)).reduce((s, g) => s + g.amount, 0);
  const successRate = grants.length > 0 ? Math.round((grants.filter(g => ['approved', 'active', 'completed'].includes(g.status)).length / grants.length) * 100) : 0;

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Grant & Funding Management</h1>
          <p className="page-subtitle">Apply for research grants, track funding, and manage compliance.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Grant Application
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: '20px' }}>
        <div className="stat-card">
          <div className="stat-value">{grants.length}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{grants.filter(g => ['approved','active'].includes(g.status)).length}</div>
          <div className="stat-label">Approved/Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${totalFunding.toLocaleString()}</div>
          <div className="stat-label">Funding Secured</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{successRate}%</div>
          <div className="stat-label">Success Rate</div>
        </div>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-input">
            <Search className="search-icon" />
            <input type="text" className="form-input" placeholder="Search grants..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${filterType === '' ? 'active' : ''}`} onClick={() => setFilterType('')}>All</button>
            <button className={`tab ${filterType === 'internal' ? 'active' : ''}`} onClick={() => setFilterType('internal')}>Internal</button>
            <button className={`tab ${filterType === 'external' ? 'active' : ''}`} onClick={() => setFilterType('external')}>External</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <DollarSign className="empty-icon" />
            <div className="empty-title">No grants found</div>
            <p>Start by applying for a research grant.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Funding Source</th>
                  <th>Amount ($)</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g._id}>
                    <td style={{ fontWeight: 600 }}>{g.title}</td>
                    <td><span className="badge badge-draft" style={{ background: g.type === 'external' ? 'rgba(139,92,246,0.15)' : 'var(--bg-secondary)', color: g.type === 'external' ? '#8b5cf6' : 'var(--text-secondary)' }}>{g.type.toUpperCase()}</span></td>
                    <td>{g.fundingSource || g.fundingAgency || '-'}</td>
                    <td>{g.amount ? g.amount.toLocaleString() : '0'}</td>
                    <td>{g.department || 'N/A'}</td>
                    <td>{getStatusBadge(g.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setShowDetail(g)}><Eye size={14} /></button>
                        {user?.role === 'director' && g.status === 'submitted' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleReview(g._id, 'approve')}><Check size={14} /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleReview(g._id, 'reject')}><XCircle size={14} /></button>
                          </>
                        )}
                        {(g.applicant?._id === user?._id || user?.role === 'director') && ['draft'].includes(g.status) && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(g._id)}><X size={14} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Grant Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">New Grant Application</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={(e) => handleSubmit(e, false)}>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Staff Name Selection</label>
                  <select className="form-input" value={form.applicant} onChange={e => setForm({...form, applicant: e.target.value})}>
                    <option value="">Select Staff...</option>
                    {researchers.map(r => <option key={r._id} value={r._id}>{r.name} ({r.department})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-input" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="internal">Internal</option>
                    <option value="external">External</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount ($) *</label>
                  <input type="number" className="form-input" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Funding Source</label>
                  <input className="form-input" value={form.fundingSource} onChange={e => setForm({...form, fundingSource: e.target.value})} placeholder="e.g. University Fund" />
                </div>
                <div className="form-group">
                  <label className="form-label">Funding Agency</label>
                  <input className="form-input" value={form.fundingAgency} onChange={e => setForm({...form, fundingAgency: e.target.value})} placeholder="e.g. NSF, WHO" />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Budget Breakdown</h4>
                <div className="form-row">
                  {Object.keys(form.budgetBreakdown).map(key => (
                    <div className="form-group" key={key}>
                      <label className="form-label">{key.charAt(0).toUpperCase() + key.slice(1)} ($)</label>
                      <input type="number" className="form-input" value={form.budgetBreakdown[key]}
                        onChange={e => setForm({...form, budgetBreakdown: {...form.budgetBreakdown, [key]: Number(e.target.value)}})} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={(e) => handleSubmit(e, true)}>Save as Draft</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
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
              <h2 className="modal-title">{showDetail.title}</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>TYPE</strong><p>{showDetail.type?.toUpperCase()}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>STATUS</strong><p>{getStatusBadge(showDetail.status)}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>AMOUNT</strong><p>${showDetail.amount?.toLocaleString()}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DEPARTMENT</strong><p>{showDetail.department || '-'}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>FUNDING SOURCE</strong><p>{showDetail.fundingSource || showDetail.fundingAgency || '-'}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>APPLICANT</strong><p>{showDetail.applicant?.name || '-'}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DESCRIPTION</strong><p style={{ fontSize: '0.875rem' }}>{showDetail.description || 'No description provided.'}</p></div>
              {showDetail.budgetBreakdown && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>BUDGET BREAKDOWN</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {Object.entries(showDetail.budgetBreakdown).filter(([,v]) => v > 0).map(([k,v]) => (
                      <span key={k} className="badge badge-draft" style={{ background: 'var(--bg-secondary)' }}>{k}: ${v.toLocaleString()}</span>
                    ))}
                  </div>
                </div>
              )}
              {showDetail.compliance && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>COMPLIANCE</strong>
                  <p style={{ fontSize: '0.875rem' }}>Ethics: {showDetail.compliance.ethicsApproved ? '✅ Approved' : '⏳ Pending'}</p>
                  {showDetail.compliance.donorRequirements && <p style={{ fontSize: '0.875rem' }}>Requirements: {showDetail.compliance.donorRequirements}</p>}
                </div>
              )}
              {showDetail.reviewComment && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>REVIEW COMMENT</strong>
                  <p style={{ fontSize: '0.875rem' }}>{showDetail.reviewComment}</p>
                </div>
              )}
            </div>
            {user?.role === 'director' && showDetail.status === 'submitted' && (
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn-success" onClick={() => handleReview(showDetail._id, 'approve')}><Check size={14} /> Approve</button>
                <button className="btn btn-danger" onClick={() => handleReview(showDetail._id, 'reject')}><XCircle size={14} /> Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
