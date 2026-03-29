import { Settings as SettingsIcon, Bell, Lock, Globe, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Settings() {
  const saveSettings = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">System Settings</h1>
        <p className="page-subtitle">Manage preferences and profile configurations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '800px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={18}/> Profile Details</h3>
          </div>
          <form className="form-row" onSubmit={saveSettings}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" defaultValue="Admin User" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" defaultValue="admin@rms.edu" disabled />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Bio Details</label>
              <textarea className="form-textarea" placeholder="Enter short bio..."></textarea>
            </div>
            <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="btn btn-primary">Update Profile</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18}/> Push Notifications</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.875rem' }}>Email me when a proposal is approved</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.875rem' }}>Email me when there's an update on a project</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.875rem' }}>Email me marketing metrics and system newsletters</span>
            </label>
            <div className="form-actions" style={{ marginTop: '8px' }}>
              <button className="btn btn-secondary" onClick={() => toast.success('Notifications updated')}>Save Preferences</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
