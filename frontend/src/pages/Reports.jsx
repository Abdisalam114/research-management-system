import { PieChart, Download, FileText, Briefcase } from 'lucide-react';
import { reportsAPI } from '../api/services';
import toast, { Toaster } from 'react-hot-toast';

export default function Reports() {
  
  const handleDownload = async (type) => {
    toast.loading(`Generating ${type} report...`, { id: 'report' });
    try {
      const apiCall = type === 'publications' ? reportsAPI.publications : reportsAPI.projects;
      const res = await apiCall({ format: 'csv' }); // Request CSV implicitly mapped on backend
      
      if (!res.data) throw new Error("No data received");
      
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated!`, { id: 'report' });
    } catch(err) {
      toast.error(`Failed to generate ${type} report`, { id: 'report' });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">System Reports</h1>
        <p className="page-subtitle">Export analytic reports regarding publications and ongoing projects.</p>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)', marginBottom: 0 }}>
                <Briefcase size={22} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>Project Report</h3>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
            Comprehensive report of all projects including budget usage, timelines, milestones, and assigned researchers.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => handleDownload('projects')} style={{ flex: 1, justifyContent: 'center' }}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', marginBottom: 0 }}>
                <FileText size={22} />
              </div>
              <h3 className="card-title" style={{ margin: 0 }}>Publication Report</h3>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.875rem' }}>
            Detailed breakdown of institutional publications, journals, citations over year, and verify statuses.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => handleDownload('publications')} style={{ flex: 1, justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)' }}>
              <Download size={16} /> Export CSV
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
              <FileText size={16} /> Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
