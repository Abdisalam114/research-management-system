import { useState, useEffect } from 'react';
import { proposalsAPI } from '../api/services';
import { FileText, Plus, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    proposalsAPI.getAll()
      .then(res => setProposals(res.data))
      .catch(err => toast.error('Failed to load proposals'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{(status || '').replace('_', ' ').toUpperCase()}</span>;
  };

  const filtered = proposals.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.department && p.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Research Proposals</h1>
          <p className="page-subtitle">Manage and review incoming and current research proposals.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> New Proposal
        </button>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-input">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by title or department..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className="tab active">All</button>
            <button className="tab">My Proposals</button>
            <button className="tab">Pending Review</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <div className="empty-title">No proposals found</div>
            <p>We could not find any proposals matching your criteria.</p>
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
                  <th>Duration (Mos)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><span className="badge badge-draft" style={{ background: 'var(--bg-secondary)' }}>{p.department || 'N/A'}</span></td>
                    <td>{p.submittedBy?.name || 'Unknown'}</td>
                    <td>{p.estimatedBudget ? p.estimatedBudget.toLocaleString() : '0'}</td>
                    <td>{p.duration || 'N/A'}</td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary">View</button>
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
