import { useState, useEffect } from 'react';
import { projectsAPI } from '../api/services';
import { Briefcase, Search, Plus, X, CheckCircle, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // active, completed, all
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [editData, setEditData] = useState(null);
  const [newMilestone, setNewMilestone] = useState({ title: '', dueDate: '' });

  const fetchProjects = () => {
    setLoading(true);
    projectsAPI.getAll()
      .then(res => setProjects(res.data))
      .catch(err => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{(status || '').replace('_', ' ').toUpperCase()}</span>;
  };

  const openManageModal = (project) => {
    setSelectedProject(project);
    setEditData({
      status: project.status,
      progress: project.progress,
      milestones: [...(project.milestones || [])]
    });
  };

  const closeManageModal = () => {
    setSelectedProject(null);
    setEditData(null);
    setNewMilestone({ title: '', dueDate: '' });
  };

  const handleUpdateProject = async () => {
    try {
      await projectsAPI.update(selectedProject._id, editData);
      toast.success('Project updated successfully');
      fetchProjects();
      closeManageModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating project');
    }
  };

  const handleAddMilestone = () => {
    if (!newMilestone.title || !newMilestone.dueDate) return toast.error('Please enter title and date');
    const ms = { title: newMilestone.title, dueDate: newMilestone.dueDate, completed: false };
    setEditData({ ...editData, milestones: [...editData.milestones, ms] });
    setNewMilestone({ title: '', dueDate: '' });
  };

  const toggleMilestone = (index) => {
    const updated = [...editData.milestones];
    updated[index].completed = !updated[index].completed;
    setEditData({ ...editData, milestones: updated });
  };

  const filtered = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'active') return ['planning', 'active', 'on_hold'].includes(p.status);
    if (activeTab === 'completed') return p.status === 'completed';
    return true; // all
  });

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">Active Projects</h1>
        <p className="page-subtitle">Track implementation, milestones, and status of approved research projects.</p>
      </div>

      {selectedProject && editData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Manage Project</h3>
              <button className="modal-close" onClick={closeManageModal}><X size={18} /></button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontWeight: 600, marginBottom: '4px' }}>{selectedProject.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Lead: {selectedProject.leadResearcher?.name || 'Unknown'}</p>
            </div>

            <div className="form-row" style={{ marginBottom: '20px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select 
                  className="form-select" 
                  value={editData.status} 
                  onChange={e => setEditData({...editData, status: e.target.value})}
                >
                  <option value="planning">PLANNING</option>
                  <option value="active">ACTIVE</option>
                  <option value="on_hold">ON HOLD</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Overall Progress ({editData.progress}%)</label>
                <input 
                  type="range" 
                  min="0" max="100" 
                  style={{ width: '100%', accentColor: 'var(--accent)', marginTop: '8px' }}
                  value={editData.progress} 
                  onChange={e => setEditData({...editData, progress: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginBottom: '20px' }}>
              <h4 className="form-label" style={{ marginBottom: '12px' }}>Project Milestones</h4>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  className="form-input form-input-sm" 
                  placeholder="New Milestone Title" 
                  value={newMilestone.title}
                  onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
                />
                <input 
                  type="date"
                  className="form-input form-input-sm" 
                  style={{ width: '140px' }}
                  value={newMilestone.dueDate}
                  onChange={e => setNewMilestone({...newMilestone, dueDate: e.target.value})}
                />
                <button type="button" className="btn btn-sm btn-primary" onClick={handleAddMilestone}>
                  <Plus size={16} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {editData.milestones.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No milestones added yet.</div>
                ) : (
                  editData.milestones.map((ms, idx) => (
                    <div key={idx} className="milestone-item" style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                      <div 
                        className={`milestone-check ${ms.completed ? 'done' : ''}`} 
                        onClick={() => toggleMilestone(idx)}
                      >
                        {ms.completed && <CheckCircle size={14} color="white" />}
                      </div>
                      <div className={`milestone-text ${ms.completed ? 'done' : ''}`}>
                        {ms.title}
                      </div>
                      <div className="milestone-date" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {ms.dueDate ? new Date(ms.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn btn-secondary" onClick={closeManageModal}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleUpdateProject}>Save Changes</button>
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
              placeholder="Search by project title..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active</button>
            <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>Completed</button>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Projects</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Briefcase className="empty-icon" />
            <div className="empty-title">No projects found</div>
            <p>You don't have any projects matching these criteria.</p>
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
                      <button className="btn btn-sm btn-secondary" onClick={() => openManageModal(p)}>Manage</button>
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
