import { useState, useEffect } from 'react';
import { publicationsAPI } from '../api/services';
import { BookOpen, Search, Upload } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Publications() {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{(status || '').replace('_', ' ').toUpperCase()}</span>;
  };

  const filtered = publications.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Publications Repository</h1>
          <p className="page-subtitle">Track, verify, and manage research publications and citations.</p>
        </div>
        <button className="btn btn-primary">
          <Upload size={16} /> Add Publication
        </button>
      </div>

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
            <button className="tab active">All</button>
            <button className="tab">Journals</button>
            <button className="tab">Conferences</button>
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
                        <button className="btn btn-sm btn-secondary">Details</button>
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
