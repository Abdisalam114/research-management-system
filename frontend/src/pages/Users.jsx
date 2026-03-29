import { useState, useEffect } from 'react';
import { usersAPI } from '../api/services';
import { Users as UsersIcon, Search, UserPlus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    usersAPI.getAll()
      .then(res => setUsers(res.data))
      .catch(err => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const getRoleBadge = (role) => {
    return <span className={`badge badge-${role}`}>{(role || '').toUpperCase()}</span>;
  };
  
  const getStatusBadge = (status) => {
    const badgeClass = status === 'active' ? 'badge-active' : (status === 'pending' ? 'badge-pending' : 'badge-rejected');
    return <span className={`badge ${badgeClass}`}>{(status || '').toUpperCase()}</span>;
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage system users, roles, and access credentials.</p>
        </div>
        <button className="btn btn-primary">
          <UserPlus size={16} /> Add User
        </button>
      </div>

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
            <button className="tab active">All Users</button>
            <button className="tab">Researchers</button>
            <button className="tab">Pending Approval</button>
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
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>{u.department || '-'}</td>
                    <td>{u.rank || '-'}</td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{getStatusBadge(u.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-sm btn-secondary">Edit</button>
                        {u.status === 'pending' && <button className="btn btn-sm btn-success">Approve</button>}
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
