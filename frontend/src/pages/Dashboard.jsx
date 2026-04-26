import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Briefcase, BookOpen, Clock, DollarSign, Award, TrendingUp, Quote } from 'lucide-react';
import { dashboardAPI } from '../api/services';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Failed to load dashboard metrics');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="splash" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <div className="spinner"></div>
    </div>
  );

  const kpis = stats?.kpis || {};
  const charts = stats?.charts || {};
  const recent = stats?.recent || {};

  const getRoleGreeting = () => {
    const roles = { director: 'Research Director', coordinator: 'Faculty Research Coordinator', finance: 'Finance Officer', researcher: 'Researcher' };
    return roles[user?.role] || 'User';
  };

  // Role-specific KPI cards
  const getKpiCards = () => {
    const common = [
      { label: 'Active Projects', value: kpis.activeProjects || 0, trend: `${kpis.totalProjects || 0} Total`, icon: Briefcase, color: '#3b82f6' },
      { label: 'Publications', value: kpis.publishedPublications || 0, trend: `${kpis.totalPublications || 0} Total`, icon: BookOpen, color: '#10b981' },
    ];

    if (user?.role === 'director') {
      return [
        ...common,
        { label: 'Pending Proposals', value: kpis.pendingProposals || 0, trend: `${kpis.totalProposals || 0} Total`, icon: FileText, color: '#f59e0b' },
        { label: 'Funding Secured', value: `$${(kpis.fundingSecured || 0).toLocaleString()}`, trend: `${kpis.grantSuccessRate || 0}% success rate`, icon: DollarSign, color: '#8b5cf6' },
        { label: 'System Users', value: kpis.totalUsers || 0, trend: `${kpis.pendingUsers || 0} Pending`, icon: Clock, color: '#ef4444' },
        { label: 'Total Citations', value: kpis.totalCitations || 0, trend: 'Research impact', icon: Quote, color: '#06b6d4' },
      ];
    }
    if (user?.role === 'coordinator') {
      return [
        ...common,
        { label: 'Faculty Proposals', value: kpis.totalProposals || 0, trend: `${kpis.approvedProposals || 0} Approved`, icon: FileText, color: '#f59e0b' },
        { label: 'Total Citations', value: kpis.totalCitations || 0, trend: 'Faculty impact', icon: Quote, color: '#06b6d4' },
      ];
    }
    if (user?.role === 'finance') {
      return [
        { label: 'Total Budget', value: `$${(kpis.totalBudget || 0).toLocaleString()}`, trend: `$${(kpis.totalExpenses || 0).toLocaleString()} spent`, icon: DollarSign, color: '#3b82f6' },
        { label: 'Remaining', value: `$${(kpis.remainingBudget || 0).toLocaleString()}`, trend: `${kpis.totalBudget > 0 ? Math.round((kpis.totalExpenses / kpis.totalBudget) * 100) : 0}% utilized`, icon: TrendingUp, color: '#10b981' },
        { label: 'Grants', value: kpis.totalGrants || 0, trend: `${kpis.approvedGrants || 0} Approved`, icon: Award, color: '#f59e0b' },
        { label: 'Active Projects', value: kpis.activeProjects || 0, trend: `${kpis.totalProjects || 0} Total`, icon: Briefcase, color: '#8b5cf6' },
      ];
    }
    // researcher
    return [
      ...common,
      { label: 'My Proposals', value: kpis.totalProposals || 0, trend: `${kpis.approvedProposals || 0} Approved`, icon: FileText, color: '#f59e0b' },
      { label: 'My Grants', value: kpis.totalGrants || 0, trend: `${kpis.approvedGrants || 0} Funded`, icon: Award, color: '#8b5cf6' },
      { label: 'My Citations', value: kpis.totalCitations || 0, trend: 'Total citations', icon: Quote, color: '#06b6d4' },
    ];
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const formatChartData = (data = []) => data.map(d => ({
    name: (d._id || 'Unknown').toString().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: d.count
  }));

  const kpiCards = getKpiCards();

  return (
    <div style={{ padding: '24px' }}>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}</h1>
        <p className="page-subtitle">{getRoleGreeting()} Dashboard — Overview of research management metrics.</p>
      </div>

      <div className="stats-grid">
        {kpiCards.map((stat, i) => (
          <div key={i} className="stat-card">
            <div style={{ background: `${stat.color}15`, color: stat.color, padding: '10px', borderRadius: '10px', width: 'fit-content', marginBottom: '12px' }}>
              <stat.icon size={22} />
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-trend" style={{ color: 'var(--text-secondary)' }}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginTop: '24px' }}>
        {/* Projects by Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Projects by Status</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatChartData(charts.projectsByStatus)} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {formatChartData(charts.projectsByStatus).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Publications by Year */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Publications by Year</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatChartData(charts.pubsByYear)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }} cursor={{ fill: 'var(--bg-card-hover)' }} />
                <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Publications by Type */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Publications by Type</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={formatChartData(charts.pubsByType)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} fill="#8884d8" label>
                  {formatChartData(charts.pubsByType).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grants by Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Grants by Status</h3>
          </div>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formatChartData(charts.grantsByStatus)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={11} width={100} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Publications by Department */}
        {user?.role !== 'researcher' && charts.pubsByDepartment?.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <h3 className="card-title">Publications by Department/Faculty</h3>
            </div>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(charts.pubsByDepartment || []).map(d => ({ name: d._id || 'Unassigned', publications: d.count, citations: d.totalCitations }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="publications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="citations" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginTop: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Proposals</h3>
          </div>
          {(recent.recentProposals || []).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recent proposals.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(recent.recentProposals || []).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>by {p.submittedBy?.name || 'Unknown'}</div>
                  </div>
                  <span className={`badge badge-${p.status}`}>{(p.status || '').replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Publications</h3>
          </div>
          {(recent.recentPublications || []).length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No recent publications.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(recent.recentPublications || []).map(p => (
                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>by {p.submittedBy?.name || 'Unknown'} • {p.year}</div>
                  </div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
