import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Briefcase, BookOpen, Clock } from 'lucide-react';
import { dashboardAPI } from '../api/services';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data))
      .catch(err => toast.error('Failed to load dashboard metrics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="splash" style={{ minHeight: '300px', background: 'transparent' }}><div className="spinner" /></div>;

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};

  const kpiCards = [
    { label: 'Active Projects', value: kpis.activeProjects || 0, trend: `${kpis.totalProjects} Total`, icon: Briefcase, isUp: true },
    { label: 'Pending Proposals', value: kpis.pendingProposals || 0, trend: `${kpis.totalProposals} Total`, icon: FileText, isUp: false },
    { label: 'Published Research', value: kpis.publishedPublications || 0, trend: `${kpis.totalPublications} Total`, icon: BookOpen, isUp: true },
    { label: 'System Users', value: kpis.totalUsers || 0, trend: `${kpis.pendingUsers} Pending`, icon: Clock, isUp: false },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const formatChartData = (data = []) => data.map(d => ({ name: (d._id || 'Unknown').replace('_', ' ').toUpperCase(), value: d.count }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name || 'User'}</h1>
        <p className="page-subtitle">Here is an overview of the Research Management System metrics.</p>
      </div>

      <div className="stats-grid">
        {kpiCards.map((stat, i) => (
          <div key={i} className="stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', borderRadius: '8px' }}>
              <stat.icon size={22} />
            </div>
            <div className="stat-value" style={{ marginTop: '10px' }}>{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-trend ${stat.isUp ? 'up' : 'down'}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Projects by Status</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={formatChartData(charts.projectsByStatus)} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  fill="#8884d8" 
                  label
                >
                  {formatChartData(charts.projectsByStatus).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Publications by Year</h3>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={formatChartData(charts.pubsByYear)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }} cursor={{fill: 'var(--bg-card-hover)'}} />
                <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
