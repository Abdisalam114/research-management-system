import { useState, useEffect } from 'react';
import { projectsAPI } from '../api/services';
import { Briefcase, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    projectsAPI.getAll()
      .then(res => setProjects(res.data))
      .catch(err => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{(status || '').replace('_', ' ').toUpperCase()}</span>;
  };

  const filtered = projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">Active Projects</h1>
        <p className="page-subtitle">Track implementation, milestones, and status of approved research projects.</p>
      </div>

      <div className="card">
        <div className="filters-bar">
          <div className="search-input">
            <Search className="search-icon" />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search by project title..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className="tab active">Active</button>
            <button className="tab">Completed</button>
            <button className="tab">All Projects</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Briefcase className="empty-icon" />
            <div className="empty-title">No projects active</div>
            <p>You don't have any projects running at the moment.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Lead Researcher</th>
                  <th>Department</th>
                  <th>Progress</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td>{p.leadResearcher?.name || 'Unknown'}</td>
                    <td>{p.department || 'N/A'}</td>
                    <td style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${p.progress || 0}%` }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td>{getStatusBadge(p.status)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary">Manage</button>
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
