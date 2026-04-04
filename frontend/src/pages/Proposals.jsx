import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { proposalsAPI, usersAPI } from '../api/services';
import { FileText, Plus, Search, X, Eye, Check, XCircle, RotateCcw, UserPlus, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Proposals() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [researchers, setResearchers] = useState([]);
  const [form, setForm] = useState({
    title: '', abstract: '', keywords: '', researchers: [],
    estimatedBudget: '', duration: 12, department: user?.department || '',
    ethicsRequired: false
  });

  const fetchProposals = () => {
    setLoading(true);
    proposalsAPI.getAll()
      .then(res => setProposals(res.data))
      .catch(() => toast.error('Failed to load proposals'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProposals(); }, []);
  useEffect(() => {
    if (showModal) usersAPI.getAll({ status: 'active', role: 'researcher' }).then(r => setResearchers(r.data)).catch(() => {});
  }, [showModal]);

  const handleCreate = async (e, asDraft = true) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        estimatedBudget: Number(form.estimatedBudget) || 0,
        submit: !asDraft
      };
      await proposalsAPI.create(data);
      toast.success(asDraft ? 'Proposal saved as draft' : 'Proposal submitted!');
      setShowModal(false);
      setForm({ title: '', abstract: '', keywords: '', researchers: [], estimatedBudget: '', duration: 12, department: user?.department || '', ethicsRequired: false });
      fetchProposals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating proposal');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await proposalsAPI.update(id, { submit: true });
      toast.success('Proposal submitted!');
      fetchProposals();
      setShowDetail(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleReview = async (id, action) => {
    const comment = window.prompt(`Comment for ${action}:`);
    if (comment === null) return;
    try {
      await proposalsAPI.review(id, { action, comment });
      toast.success(`Proposal ${action === 'forward' ? 'forwarded' : action === 'revision' ? 'sent for revision' : 'rejected'}`);
      fetchProposals();
      setShowDetail(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDecision = async (id, action) => {
    const comment = window.prompt(`Comment for ${action}:`);
    if (comment === null) return;
    try {
      await proposalsAPI.decide(id, { action, comment });
      toast.success(`Proposal ${action}d!`);
      fetchProposals();
      setShowDetail(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this proposal?')) return;
    try {
      await proposalsAPI.delete(id);
      toast.success('Proposal deleted');
      fetchProposals();
    } catch (err) { toast.error('Error deleting'); }
  };

  const getStatusBadge = (status) => <span className={`badge badge-${status}`}>{(status || '').replace(/_/g, ' ').toUpperCase()}</span>;

  const filtered = proposals.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeTab === 'all') return matchSearch;
    if (activeTab === 'mine') return matchSearch && p.submittedBy?._id === user?._id;
    if (activeTab === 'pending') return matchSearch && ['submitted', 'under_review'].includes(p.status);
    return matchSearch;
  });

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Research Proposals</h1>
          <p className="page-subtitle">Submit, review, and track research proposals through the approval workflow.</p>
        </div>
        {['researcher', 'admin'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> New Proposal
          </button>
        )}
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-input">
            <Search className="search-icon" />
            <input type="text" className="form-input" placeholder="Search by title or department..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
            <button className={`tab ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>My Proposals</button>
            <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Review</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <div className="empty-title">No proposals found</div>
            <p>No proposals match your criteria.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Submitted By</th>
                  <th>Budget ($)</th>
                  <th>Duration</th>
                  <th>Ethics</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                    <td><span className="badge badge-draft" style={{ background: 'var(--bg-secondary)' }}>{p.department || 'N/A'}</span></td>
                    <td>{p.submittedBy?.name || 'Unknown'}</td>
                    <td>{p.estimatedBudget ? p.estimatedBudget.toLocaleString() : '0'}</td>
                    <td>{p.duration || 'N/A'} mos</td>
                    <td>
                      {p.ethicsApproval?.required ? (
                        <span className={`badge badge-${p.ethicsApproval?.status === 'approved' ? 'approved' : p.ethicsApproval?.status === 'rejected' ? 'rejected' : 'submitted'}`} style={{ fontSize: '0.65rem' }}>
                          <Shield size={10} style={{ marginRight: '2px' }} />
                          {p.ethicsApproval?.status?.toUpperCase()}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>N/A</span>
                      )}
                    </td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setShowDetail(p)} title="View"><Eye size={14} /></button>
                        {/* Coordinator: review submitted proposals */}
                        {user?.role === 'coordinator' && p.status === 'submitted' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleReview(p._id, 'forward')} title="Forward to Director"><Check size={14} /></button>
                            <button className="btn btn-sm btn-warning" onClick={() => handleReview(p._id, 'revision')} title="Request Revision"><RotateCcw size={14} /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleReview(p._id, 'reject')} title="Reject"><XCircle size={14} /></button>
                          </>
                        )}
                        {/* Admin/Director: decide on under_review proposals */}
                        {user?.role === 'admin' && p.status === 'under_review' && (
                          <>
                            <button className="btn btn-sm btn-success" onClick={() => handleDecision(p._id, 'approve')} title="Approve"><Check size={14} /></button>
                            <button className="btn btn-sm btn-danger" onClick={() => handleDecision(p._id, 'reject')} title="Reject"><XCircle size={14} /></button>
                          </>
                        )}
                        {/* Owner: submit draft or delete */}
                        {p.submittedBy?._id === user?._id && ['draft', 'revision_requested'].includes(p.status) && (
                          <button className="btn btn-sm btn-primary" onClick={() => handleSubmit(p._id)} title="Submit">Submit</button>
                        )}
                        {(p.submittedBy?._id === user?._id || user?.role === 'admin') && ['draft'].includes(p.status) && (
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)} title="Delete"><X size={14} /></button>
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

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">New Research Proposal</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={e => handleCreate(e, false)}>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Abstract *</label>
                  <textarea className="form-textarea" value={form.abstract} onChange={e => setForm({...form, abstract: e.target.value})} rows={4} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Keywords (comma-separated)</label>
                  <input className="form-input" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="AI, Machine Learning, NLP" />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Budget ($)</label>
                  <input type="number" className="form-input" value={form.estimatedBudget} onChange={e => setForm({...form, estimatedBudget: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (months)</label>
                  <input type="number" className="form-input" value={form.duration} onChange={e => setForm({...form, duration: Number(e.target.value)})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.ethicsRequired} onChange={e => setForm({...form, ethicsRequired: e.target.checked})} />
                    <span className="form-label" style={{ margin: 0 }}><Shield size={14} style={{ marginRight: '4px' }} /> Requires Ethics Approval</span>
                  </label>
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Co-Researchers</label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px' }}>
                    {researchers.filter(r => r._id !== user?._id).map(r => (
                      <label key={r._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer', borderRadius: '4px', fontSize: '0.85rem' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <input type="checkbox" checked={form.researchers.includes(r._id)}
                          onChange={() => setForm(prev => ({ ...prev, researchers: prev.researchers.includes(r._id) ? prev.researchers.filter(id => id !== r._id) : [...prev.researchers, r._id] }))} />
                        {r.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>({r.department || r.email})</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={e => handleCreate(e, true)}>Save as Draft</button>
                <button type="submit" className="btn btn-primary">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">{showDetail.title}</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}><X size={20} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>STATUS</strong><div style={{ marginTop: '4px' }}>{getStatusBadge(showDetail.status)}</div></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DEPARTMENT</strong><p>{showDetail.department || '-'}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>BUDGET</strong><p>${showDetail.estimatedBudget?.toLocaleString() || 0}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DURATION</strong><p>{showDetail.duration} months</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>SUBMITTED BY</strong><p>{showDetail.submittedBy?.name || '-'}</p></div>
              <div><strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>VERSION</strong><p>v{showDetail.currentVersion || 1}</p></div>
              <div style={{ gridColumn: '1 / -1' }}>
                <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>ABSTRACT</strong>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginTop: '6px' }}>{showDetail.abstract}</p>
              </div>
              {showDetail.keywords?.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>KEYWORDS</strong>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {showDetail.keywords.map((k, i) => <span key={i} className="badge badge-draft" style={{ background: 'var(--bg-secondary)' }}>{k}</span>)}
                  </div>
                </div>
              )}
              {showDetail.researchers?.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>CO-RESEARCHERS</strong>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {showDetail.researchers.map(r => <span key={r._id} className="badge badge-approved">{r.name}</span>)}
                  </div>
                </div>
              )}

              {/* Ethics Approval */}
              {showDetail.ethicsApproval?.required && (
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}><Shield size={12} /> ETHICS APPROVAL</strong>
                  <div style={{ marginTop: '6px' }}>
                    <span className={`badge badge-${showDetail.ethicsApproval.status === 'approved' ? 'approved' : showDetail.ethicsApproval.status === 'rejected' ? 'rejected' : 'submitted'}`}>
                      {showDetail.ethicsApproval.status?.toUpperCase()}
                    </span>
                    {showDetail.ethicsApproval.comment && <p style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-secondary)' }}>{showDetail.ethicsApproval.comment}</p>}
                  </div>
                </div>
              )}

              {/* Coordinator Review */}
              {showDetail.coordinatorReview?.reviewer && (
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>COORDINATOR REVIEW</strong>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Reviewed by: {showDetail.coordinatorReview.reviewer?.name}</p>
                  {showDetail.coordinatorReview.comment && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{showDetail.coordinatorReview.comment}"</p>}
                </div>
              )}

              {/* Director Decision */}
              {showDetail.directorDecision?.decidedBy && (
                <div style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>DIRECTOR DECISION</strong>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Decided by: {showDetail.directorDecision.decidedBy?.name}</p>
                  {showDetail.directorDecision.comment && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>"{showDetail.directorDecision.comment}"</p>}
                </div>
              )}

              {/* Version History */}
              {showDetail.versions?.length > 0 && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>VERSION HISTORY</strong>
                  <div style={{ marginTop: '8px' }}>
                    {showDetail.versions.map((v, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>v{v.versionNumber}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{new Date(v.savedAt).toLocaleDateString()}</span>
                        {v.changes && <span style={{ color: 'var(--text-tertiary)' }}>{v.changes}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons based on role & status */}
            <div className="form-actions" style={{ marginTop: '20px' }}>
              {user?.role === 'coordinator' && showDetail.status === 'submitted' && (
                <>
                  <button className="btn btn-success" onClick={() => handleReview(showDetail._id, 'forward')}><Check size={14} /> Forward to Director</button>
                  <button className="btn btn-warning" onClick={() => handleReview(showDetail._id, 'revision')}><RotateCcw size={14} /> Request Revision</button>
                  <button className="btn btn-danger" onClick={() => handleReview(showDetail._id, 'reject')}><XCircle size={14} /> Reject</button>
                </>
              )}
              {user?.role === 'admin' && showDetail.status === 'under_review' && (
                <>
                  <button className="btn btn-success" onClick={() => handleDecision(showDetail._id, 'approve')}><Check size={14} /> Approve</button>
                  <button className="btn btn-danger" onClick={() => handleDecision(showDetail._id, 'reject')}><XCircle size={14} /> Reject</button>
                </>
              )}
              {showDetail.submittedBy?._id === user?._id && ['draft', 'revision_requested'].includes(showDetail.status) && (
                <button className="btn btn-primary" onClick={() => handleSubmit(showDetail._id)}>Submit Proposal</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
