import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authAPI } from '../api/services';
import toast, { Toaster } from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    rank: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error('Name, email and password are required');
    }
    
    setIsLoading(true);
    try {
      await authAPI.register(formData);
      toast.success('Registration successful. Awaiting admin approval.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="auth-page">
      <Toaster position="top-right" />
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo" style={{ marginBottom: '24px' }}>
          <img src="/logo.png" alt="Jamhuriya Logo" style={{ width: '80px', height: '80px', margin: '0 auto 16px', display: 'block', objectFit: 'contain' }} />
          <h1 className="auth-title">Jamhuriya Research Portal</h1>
          <p className="auth-sub">Sign up to manage your research</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              placeholder="Dr. Jane Doe"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              placeholder="name@university.edu"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Department</label>
              <select name="department" className="form-select" value={formData.department} onChange={handleChange}>
                <option value="">Select Dept...</option>
                <option value="CS">Computer Science</option>
                <option value="BME">Biomedical Engineering</option>
                <option value="ENV">Environmental Sciences</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rank / Title</label>
              <input 
                type="text" 
                name="rank"
                className="form-input" 
                placeholder="e.g. Professor"
                value={formData.rank}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={formData.role || ''} onChange={handleChange} required>
              <option value="">Select Role...</option>
              <option value="researcher">Researcher</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              placeholder="Enter strong password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isLoading}
          >
            {isLoading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login">Sign In here</Link>
        </div>
      </div>
    </div>
  );
}
