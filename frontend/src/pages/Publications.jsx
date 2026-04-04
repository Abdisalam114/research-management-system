import { useState, useEffect } from 'react';
import { publicationsAPI } from '../api/services';
import { BookOpen, Search, Upload, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newPub, setNewPub] = useState({ title: '', authors: '', type: 'journal', year: new Date().getFullYear(), journal: '', abstract: '' });
  
  const [selectedPub, setSelectedPub] = useState(null);

  const fetchPubs = () => {
    setLoading(true);
    publicationsAPI.getAll()
      .then(res => setPublications(res.data))
      .catch(err => toast.error('Failed to load publications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPubs();
  }, []);

  const handleVerify = async (id) => {
    try {
      await publicationsAPI.verify(id);
      toast.success('Publication verified!');
      fetchPubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error verifying publication');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newPub,
        authorNames: newPub.authors.split(',').map(a => a.trim()).filter(a => a)
      };
      await publicationsAPI.create(payload);
      toast.success('Publication added successfully!');
      setShowAddModal(false);
      setNewPub({ title: '', authors: '', type: 'journal', year: new Date().getFullYear(), journal: '', abstract: '' });
      fetchPubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding publication');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this publication?')) return;
    try {
      await publicationsAPI.delete(id);
      toast.success('Publication deleted');
      setSelectedPub(null);
      fetchPubs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting publication');
    }
  };

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{(status || '').replace('_', ' ').toUpperCase()}</span>;
  };

  const filtered = publications.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'journal') return p.type === 'journal';
    if (activeTab === 'conference') return p.type === 'conference';
    return true;
  });

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Publications Repository</h1>
          <p className="page-subtitle">Track, verify, and manage research publications and citations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Upload size={16} /> Add Publication
        </button>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Publication</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" className="form-input" required
                  value={newPub.title} onChange={e => setNewPub({...newPub, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Authors (comma separated)</label>
                <input 
                  type="text" className="form-input" required
                  placeholder="e.g. John Doe, Jane Smith"
                  value={newPub.authors} onChange={e => setNewPub({...newPub, authors: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select" 
                    value={newPub.type} onChange={e => setNewPub({...newPub, type: e.target.value})}
                  >
                    <option value="journal">Journal</option>
                    <option value="conference">Conference</option>
                    <option value="book_chapter">Book Chapter</option>
                    <option value="patent">Patent</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input 
                    type="number" className="form-input" required
                    value={newPub.year} onChange={e => setNewPub({...newPub, year: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{newPub.type === 'conference' ? 'Conference Name' : 'Journal Name'}</label>
                <input 
                  type="text" className="form-input" 
                  value={newPub.journal} onChange={e => setNewPub({...newPub, journal: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Abstract</label>
                <textarea 
                  className="form-input" rows="3"
                  value={newPub.abstract} onChange={e => setNewPub({...newPub, abstract: e.target.value})}
                ></textarea>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Publication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPub && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Publication Details</h3>
              <button className="modal-close" onClick={() => setSelectedPub(null)}><X size={18} /></button>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: '8px' }}>{selectedPub.title}</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                <strong>Authors:</strong> {(selectedPub.authorNames || []).join(', ')} <br/>
                <strong>Published:</strong> {selectedPub.year} • <span style={{ textTransform: 'capitalize' }}>{selectedPub.type}</span>
              </p>
              
              {selectedPub.abstract && (
                <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <strong>Abstract:</strong><br/>
                  {selectedPub.abstract}
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge badge-${selectedPub.type}`}>{selectedPub.type.toUpperCase()}</span>
                {getStatusBadge(selectedPub.status)}
                {selectedPub.citationCount > 0 && <span className="badge badge-primary">{selectedPub.citationCount} Citations</span>}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(selectedPub._id)}>Delete</button>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedPub(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="filters-bar">
          <div className="search-input">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by publication title..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
            <button className={`tab ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>Journals</button>
            <button className={`tab ${activeTab === 'conference' ? 'active' : ''}`} onClick={() => setActiveTab('conference')}>Conferences</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <BookOpen className="empty-icon" />
            <div className="empty-title">No publications yet</div>
            <p>Upload or link a publication to track citations.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Authors</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Citations</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600, maxWidth: '300px', whiteSpace: 'normal' }}>{p.title}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'normal', color: 'var(--text-secondary)' }}>
                      {(p.authorNames || []).join(', ')}
                    </td>
                    <td>
                      <span className={`badge badge-${p.type}`}>{p.type?.toUpperCase()}</span>
                    </td>
                    <td>{p.year}</td>
                    <td style={{ fontWeight: 700 }}>{p.citationCount || 0}</td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelectedPub(p)}>Details</button>
                        {p.status !== 'verified' && p.status !== 'published' && (
                          <button className="btn btn-sm btn-success" onClick={() => handleVerify(p._id)}>Verify</button>
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
    </div>
  );
}
