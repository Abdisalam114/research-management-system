import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Download, FileText, Briefcase, DollarSign, Users, Award } from 'lucide-react';
import { reportsAPI } from '../api/services';
import toast, { Toaster } from 'react-hot-toast';

export default function Reports() {
  const { user } = useAuth();
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleDownload = async (type) => {
    toast.loading(`Generating ${type} report...`, { id: 'report' });
    try {
      const apiMap = {
        publications: reportsAPI.publications,
        projects: reportsAPI.projects,
        grants: reportsAPI.grants,
        'budget-utilization': reportsAPI.budgetUtilization,
        'faculty-productivity': reportsAPI.facultyProductivity,
      };
      const apiCall = apiMap[type];
      if (!apiCall) throw new Error('Unknown report type');
      const res = await apiCall({ format: 'csv' });
      if (!res.data) throw new Error('No data received');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Report generated!`, { id: 'report' });
    } catch (err) {
      toast.error(`Failed to generate ${type} report`, { id: 'report' });
    }
  };

  const handlePreview = async (type) => {
    setLoadingReport(true);
    setActiveReport(type);
    try {
      const apiMap = {
        publications: reportsAPI.publications,
        projects: reportsAPI.projects,
        grants: reportsAPI.grants,
        'budget-utilization': reportsAPI.budgetUtilization,
        'faculty-productivity': reportsAPI.facultyProductivity,
      };
      const res = await apiMap[type]({});
      setReportData(res.data);
    } catch (err) {
      toast.error('Failed to load report data');
      setReportData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  const reportCards = [
    {
      id: 'projects', title: 'Project Report', icon: Briefcase, color: 'var(--accent)',
      description: 'Comprehensive report of all projects including timelines, milestones, and assigned researchers.',
      roles: ['admin', 'coordinator', 'finance']
    },
    {
      id: 'publications', title: 'Publication Report', icon: FileText, color: 'var(--success)',
      description: 'Breakdown of publications, journals, citations, and verification statuses.',
      roles: ['admin', 'coordinator']
    },
    {
      id: 'grants', title: 'Grant Report', icon: Award, color: '#8b5cf6',
      description: 'Grant applications, funding sources, amounts, and approval statuses.',
      roles: ['admin', 'coordinator', 'finance']
    },
    {
      id: 'budget-utilization', title: 'Budget Utilization Report', icon: DollarSign, color: '#f59e0b',
      description: 'Budget allocation vs. actual expenses, utilization rates per project.',
      roles: ['admin', 'finance']
    },
    {
      id: 'faculty-productivity', title: 'Faculty Productivity Report', icon: Users, color: '#06b6d4',
      description: 'Research productivity per faculty member: publications, projects, grants, and citations.',
      roles: ['admin', 'coordinator']
    }
  ];

  const visibleCards = reportCards.filter(c => c.roles.includes(user?.role));

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">Research Analytics & Reports</h1>
        <p className="page-subtitle">Generate and export analytical reports for institutional research activities.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {visibleCards.map(card => (
          <div key={card.id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: `${card.color}15`, color: card.color, padding: '10px', borderRadius: '10px' }}>
                  <card.icon size={22} />
                </div>
                <h3 className="card-title" style={{ margin: 0 }}>{card.title}</h3>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {card.description}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={() => handleDownload(card.id)} style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={14} /> Export CSV
              </button>
              <button className="btn btn-secondary" onClick={() => handlePreview(card.id)} style={{ flex: 1, justifyContent: 'center' }}>
                <PieChart size={14} /> Preview
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Preview */}
      {activeReport && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title">
              {reportCards.find(r => r.id === activeReport)?.title || 'Report'} — Preview
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(activeReport)}>
                <Download size={14} /> Export
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setActiveReport(null)}>Close</button>
            </div>
          </div>
          {loadingReport ? (
            <div className="splash" style={{ minHeight: '150px', background: 'transparent' }}><div className="spinner" /></div>
          ) : reportData.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No data available for this report.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {Object.keys(reportData[0]).map(key => (
                      <th key={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.slice(0, 50).map((row, i) => (
                    <tr key={i}>
                      {Object.values(row).map((val, j) => (
                        <td key={j} style={{ fontSize: '0.82rem' }}>{val?.toString() || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.length > 50 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '12px', fontSize: '0.8rem' }}>
                  Showing 50 of {reportData.length} rows. Export CSV for full data.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
