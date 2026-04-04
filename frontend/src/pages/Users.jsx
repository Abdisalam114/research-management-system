import { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { Users as UsersIcon, Search, UserPlus, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: 'Password123', role: 'researcher', department: '', rank: '' });

  const fetchUsers = () => {
    setLoading(true);
    usersAPI.getAll()
      .then(res => setUsers(res.data))
      .catch(err => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id) => {
    try {
      await usersAPI.approve(id);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error approving user');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this user?')) return;
    try {
      await usersAPI.reject(id);
      toast.success('User rejected successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting user');
    }
  };

  const startEdit = (u) => {
    setEditingId(u._id);
    setEditValues({ name: u.name, rank: u.rank || '', department: u.department || '', role: u.role, status: u.status });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = async (id) => {
    try {
      await usersAPI.update(id, editValues);
      toast.success('User updated successfully');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this user? This action cannot be undone.')) return;
    try {
      await usersAPI.delete(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(newUser);
      toast.success('User created successfully');
      setShowAddModal(false);
      setNewUser({ name: '', email: '', password: 'Password123', role: 'researcher', department: '', rank: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating user');
    }
  };

  const getRoleBadge = (role) => {
    if (role === 'student') return <span className="badge badge-student">STUDENT</span>;
    if (role === 'admin') return <span className="badge badge-admin">DIRECTOR</span>;
    if (role === 'coordinator') return <span className="badge badge-coordinator">ASSIST DIRECTOR</span>;
    return <span className={`badge badge-${role}`}>{(role || '').toUpperCase()}</span>;
  };
  
  const getStatusBadge = (status) => {
    const badgeClass = status === 'active' ? 'badge-active' : (status === 'pending' ? 'badge-pending' : (status === 'inactive' ? 'badge-inactive' : 'badge-rejected'));
    return <span className={`badge ${badgeClass}`}>{(status || '').toUpperCase()}</span>;
  };

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'researchers') return matchesSearch && u.role === 'researcher';
    if (activeTab === 'pending') return matchesSearch && u.status === 'pending';
    return matchesSearch;
  });

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and access credentials.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add User
        </button>
      </div>

      {showAddModal && (
        <div className="modal-backdrop">
          <div className="card modal-content" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">Add New User</h3>
              <button className="btn btn-icon" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleAddUser} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input required className="form-input" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input required type="email" className="form-input" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                    <option value="researcher">RESEARCHER</option>
                    <option value="student">STUDENT</option>
                    <option value="coordinator">ASSIST DIRECTOR</option>
                    <option value="finance">FINANCE</option>
                    <option value="admin">DIRECTOR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" value={newUser.department} onChange={e => setNewUser({...newUser, department: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Rank / Title</label>
                <input className="form-input" value={newUser.rank} onChange={e => setNewUser({...newUser, rank: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Initial Password</label>
                <input className="form-input" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create User</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
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
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Users</button>
            <button className={`tab ${activeTab === 'researchers' ? 'active' : ''}`} onClick={() => setActiveTab('researchers')}>Researchers</button>
            <button className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Approval</button>
          </div>
        </div>

        {loading ? (
          <div className="splash" style={{ minHeight: '200px', background: 'transparent' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <UsersIcon className="empty-icon" />
            <div className="empty-title">No users found</div>
            <p>We could not find any users matching your criteria.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Rank / Title</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const isEditing = editingId === u._id;
                  return (
                    <tr key={u._id}>
                      <td>
                        {isEditing ? (
                          <input 
                            className="form-input form-input-sm" 
                            style={{ fontWeight: 600 }}
                            value={editValues.name} 
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          />
                        ) : (
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td>
                        {isEditing ? (
                          <input 
                            className="form-input form-input-sm" 
                            disabled={['admin', 'coordinator', 'finance'].includes(editValues.role)}
                            value={['admin', 'coordinator', 'finance'].includes(editValues.role) ? 'N/A' : editValues.department} 
                            onChange={(e) => setEditValues({ ...editValues, department: e.target.value })}
                          />
                        ) : ['admin', 'coordinator', 'finance'].includes(u.role) ? 'N/A' : (u.department || '-')}
                      </td>
                      <td>
                        {isEditing ? (
                          <input 
                            className="form-input form-input-sm" 
                            value={editValues.rank} 
                            onChange={(e) => setEditValues({ ...editValues, rank: e.target.value })}
                          />
                        ) : u.rank || '-'}
                      </td>
                      <td>
                        {isEditing ? (
                          <select 
                            className="form-select form-input-sm" 
                            value={editValues.role}
                            onChange={(e) => setEditValues({ ...editValues, role: e.target.value })}
                          >
                            <option value="researcher">RESEARCHER</option>
                            <option value="student">STUDENT</option>
                            <option value="coordinator">ASSIST DIRECTOR</option>
                            <option value="finance">FINANCE</option>
                            <option value="admin">DIRECTOR</option>
                          </select>
                        ) : getRoleBadge(u.role)}
                      </td>
                      <td>
                        {isEditing ? (
                          <select 
                            className="form-select form-input-sm" 
                            value={editValues.status}
                            onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
                          >
                            <option value="active">ACTIVE</option>
                            <option value="pending">PENDING</option>
                            <option value="inactive">INACTIVE</option>
                            <option value="rejected">REJECTED</option>
                          </select>
                        ) : getStatusBadge(u.status)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isEditing ? (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => handleSave(u._id)}>Save</button>
                              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button className="btn btn-sm btn-secondary" onClick={() => startEdit(u)}>Edit</button>
                              {u._id !== currentUser?._id && currentUser?.role === 'admin' && (
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u._id)}>Delete</button>
                              )}
                              {u.status === 'pending' && (
                                <>
                                  <button className="btn btn-sm btn-success" onClick={() => handleApprove(u._id)}>Approve</button>
                                  <button className="btn btn-sm btn-warning" onClick={() => handleReject(u._id)}>Reject</button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
