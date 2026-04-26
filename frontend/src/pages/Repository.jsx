import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { repositoryAPI } from '../api/services';
import { 
  Database, Search, Plus, Filter, FileText, Download, 
  ExternalLink, Eye, ShieldCheck, AlertCircle, X, ChevronRight,
  Shield, Book, Layers, BarChart as BarChartIcon
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Repository() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [stats, setStats] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', type: 'publication', abstract: '',
    authorNames: '', keywords: '', department: user?.department || '',
    accessLevel: 'institutional', license: 'all-rights-reserved'
  });

  const fetchItems = () => {
    setLoading(true);
    repositoryAPI.getAll({ type: activeType === 'all' ? undefined : activeType })
      .then(res => setItems(res.data))
      .catch(() => toast.error('Failed to load repository items'))
      .finally(() => setLoading(false));
  };

  const fetchStats = () => {
    repositoryAPI.getStats()
      .then(res => setStats(res.data))
      .catch(() => {});
  };

  useEffect(() => { 
    fetchItems();
    fetchStats();
  }, [activeType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        authorNames: form.authorNames.split(',').map(n => n.trim()).filter(Boolean),
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      };
      await repositoryAPI.create(data);
      toast.success('Item added to repository! Scanning for plagiarism...');
      setShowModal(false);
      setForm({
        title: '', description: '', type: 'publication', abstract: '',
        authorNames: '', keywords: '', department: user?.department || '',
        accessLevel: 'institutional', license: 'all-rights-reserved'
      });
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding item');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: 'badge-active',
      approved: 'badge-approved',
      under_review: 'badge-pending',
      draft: 'badge-draft',
      archived: 'badge-rejected'
    };
    return <span className={`badge ${badges[status] || 'badge-draft'}`}>{(status || '').toUpperCase()}</span>;
  };

  const getPlagiarismBadge = (check) => {
    if (!check || check.status === 'not_checked') return null;
    if (check.status === 'pending') return <span className="badge badge-pending" style={{ fontSize: '0.65rem' }}>PLAGIARISM: PENDING</span>;
    if (check.status === 'passed') return <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}><ShieldCheck size={10} /> PLAGIARISM: {check.score}% MATCH</span>;
    return <span className="badge badge-rejected" style={{ fontSize: '0.65rem' }}><AlertCircle size={10} /> PLAGIARISM: {check.score}% MATCH</span>;
  };

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.abstract && i.abstract.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (i.authorNames && i.authorNames.some(n => n.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Institutional Research Repository</h1>
          <p className="page-subtitle">A secure store for university research outputs, datasets, and intellectual property.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Deposit Research
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '10px', borderRadius: '10px', width: 'fit-content', marginBottom: '12px' }}>
            <Layers size={20} />
          </div>
          <div className="stat-value">{items.length}</div>
          <div className="stat-label">Total Assets</div>
        </div>
        <div className="stat-card">
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '10px', borderRadius: '10px', width: 'fit-content', marginBottom: '12px' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="stat-value">{items.filter(i => i.status === 'published').length}</div>
          <div className="stat-label">Verified & Public</div>
        </div>
        <div className="stat-card">
          <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', padding: '10px', borderRadius: '10px', width: 'fit-content', marginBottom: '12px' }}>
            <Download size={20} />
          </div>
          <div className="stat-value">{stats?.totalDownloads || 0}</div>
          <div className="stat-label">Global Downloads</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="filters-bar" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div className="search-input" style={{ flex: 1, minWidth: '300px' }}>
            <Search className="search-icon" />
            <input type="text" className="form-input" placeholder="Search by title, author, or keyword..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${activeType === 'all' ? 'active' : ''}`} onClick={() => setActiveType('all')}>All Assets</button>
            <button className={`tab ${activeType === 'publication' ? 'active' : ''}`} onClick={() => setActiveType('publication')}>Publications</button>
            <button className={`tab ${activeType === 'dataset' ? 'active' : ''}`} onClick={() => setActiveType('dataset')}>Datasets</button>
            <button className={`tab ${activeType === 'thesis' ? 'active' : ''}`} onClick={() => setActiveType('thesis')}>Theses</button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Database className="empty-icon" />
            <div className="empty-title">No assets found</div>
            <p>The repository is empty or no items match your search.</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Asset Title & Type</th>
                <th>Authors</th>
                <th>Dept</th>
                <th>Year</th>
                <th>Verification</th>
                <th>Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i._id} onClick={() => setShowDetail(i)} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-secondary)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)'
                      }}>
                        {i.type === 'dataset' ? <BarChartIcon size={16} /> : <FileText size={16} />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{i.title}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{i.type.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {(i.authorNames || []).slice(0, 2).join(', ')}
                      {i.authorNames?.length > 2 && ' et al.'}
                    </div>
                  </td>
                  <td><span className="badge badge-draft" style={{ background: 'var(--bg-secondary)' }}>{i.department || 'N/A'}</span></td>
                  <td>{i.year}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {getStatusBadge(i.status)}
                      {getPlagiarismBadge(i.plagiarismCheck)}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                      <Shield size={12} /> {i.accessLevel.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-sm btn-secondary" onClick={() => setShowDetail(i)}><Eye size={14} /></button>
                      <button className="btn btn-sm btn-secondary" title="Download"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2 className="modal-title">Asset Details</h2>
              <button className="modal-close" onClick={() => setShowDetail(null)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span className="badge badge-approved" style={{ background: 'var(--accent)', color: 'white' }}>{showDetail.type.toUpperCase()}</span>
                  {getStatusBadge(showDetail.status)}
                </div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{showDetail.title}</h1>
                
                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '4px' }}>ABSTRACT / DESCRIPTION</strong>
                  <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                    {showDetail.abstract || showDetail.description || 'No description available.'}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>AUTHORS</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(showDetail.authorNames || []).map((name, idx) => (
                      <span key={idx} className="badge badge-draft" style={{ background: 'var(--bg-secondary)', padding: '6px 12px' }}>{name}</span>
                    ))}
                  </div>
                </div>

                {showDetail.keywords?.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <strong style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', marginBottom: '8px' }}>KEYWORDS</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {showDetail.keywords.map((k, idx) => (
                        <span key={idx} style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>#{k}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>IDENTIFIERS</strong>
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', marginBottom: '4px' }}>
                      <strong>DOI:</strong> {showDetail.doi || <span style={{ color: 'var(--text-tertiary)' }}>Not assigned</span>}
                    </div>
                    {showDetail.doi && (
                      <a href={`https://doi.org/${showDetail.doi}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ExternalLink size={12} /> View on DOI.org
                      </a>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>METADATA</strong>
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Year:</span>
                      <span>{showDetail.year}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>Language:</span>
                      <span>{showDetail.language}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>License:</span>
                      <span>{showDetail.license.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                  <strong style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>INSTITUTIONAL SAFEGUARDS</strong>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      {showDetail.plagiarismCheck?.status === 'passed' ? <ShieldCheck size={16} color="#10b981" /> : <AlertCircle size={16} color="#f59e0b" />}
                      <span style={{ fontSize: '0.75rem' }}>Originality Verified</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '24px' }}>
                      Score: {showDetail.plagiarismCheck?.score || 0}% match detected.
                    </div>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                  <Download size={16} /> Download Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Deposit Research Asset</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="e.g., Deep Learning in Biomedical Imaging" />
                </div>
                <div className="form-group">
                  <label className="form-label">Asset Type</label>
                  <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="publication">Publication</option>
                    <option value="dataset">Dataset</option>
                    <option value="thesis">Thesis</option>
                    <option value="report">Research Report</option>
                    <option value="proposal">Approved Proposal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Abstract / Summary</label>
                  <textarea className="form-textarea" value={form.abstract} onChange={e => setForm({...form, abstract: e.target.value})} rows={3} />
                </div>
                <div className="form-group">
                  <label className="form-label">Authors (comma-separated)</label>
                  <input className="form-input" value={form.authorNames} onChange={e => setForm({...form, authorNames: e.target.value})} placeholder="Dr. John Smith, Dr. Jane Doe" />
                </div>
                <div className="form-group">
                  <label className="form-label">Keywords</label>
                  <input className="form-input" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="AI, Health, MRI" />
                </div>
                <div className="form-group">
                  <label className="form-label">Access Level</label>
                  <select className="form-select" value={form.accessLevel} onChange={e => setForm({...form, accessLevel: e.target.value})}>
                    <option value="public">Public (Open Access)</option>
                    <option value="institutional">Institutional Only</option>
                    <option value="restricted">Restricted (Director Approval)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">License</label>
                  <select className="form-select" value={form.license} onChange={e => setForm({...form, license: e.target.value})}>
                    <option value="cc-by">Creative Commons BY</option>
                    <option value="cc-by-sa">Creative Commons BY-SA</option>
                    <option value="all-rights-reserved">All Rights Reserved</option>
                  </select>
                </div>
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit to Repository</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
