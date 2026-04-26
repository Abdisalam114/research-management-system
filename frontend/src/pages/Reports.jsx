import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { PieChart, Download, FileText, Briefcase, DollarSign, Users, Award } from 'lucide-react';
import { reportsAPI } from '../api/services';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function Reports() {
  const { user } = useAuth();
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  const handleDownload = async (type, format = 'csv') => {
    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`);
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

      // For PDF/Excel, we fetch JSON data first and generate on frontend
      // For CSV, we can still fetch as blob or generate from JSON
      const res = await apiCall({ format: 'json' });
      const data = res.data;
      
      if (!data || data.length === 0) {
        throw new Error('No data found for this report');
      }

      const filename = `${type}_report_${new Date().toISOString().split('T')[0]}`;

      if (format === 'pdf') {
        const doc = new jsPDF('l', 'pt', 'a4');
        const title = type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Report';
        
        doc.setFontSize(20);
        doc.text(title, 40, 40);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 60);

        const headers = Object.keys(data[0]).map(k => k.replace(/([A-Z])/g, ' $1').toUpperCase());
        const rows = data.map(obj => Object.values(obj));

        autoTable(doc, {
          startY: 80,
          head: [headers],
          body: rows,
          styles: { fontSize: 8, cellPadding: 5 },
          headStyles: { fillColor: [14, 165, 233], textColor: 255 },
          alternateRowStyles: { fillColor: [245, 247, 250] },
        });

        doc.save(`${filename}.pdf`);
      } 
      else if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      }
      else {
        // CSV
        const fields = Object.keys(data[0]);
        const csv = [
          fields.join(','),
          ...data.map(row => fields.map(f => `"${(row[f] || '').toString().replace(/"/g, '""')}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast.success(`${format.toUpperCase()} report downloaded!`, { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(err.message || `Failed to generate ${type} report`, { id: toastId });
    }
  };

  const handlePreview = async (type) => {
    setReportData([]);
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
      console.log(`Report Data for ${type}:`, res.data);
      setReportData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
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
      roles: ['director', 'coordinator', 'finance']
    },
    {
      id: 'publications', title: 'Publication Report', icon: FileText, color: 'var(--success)',
      description: 'Breakdown of publications, journals, citations, and verification statuses.',
      roles: ['director', 'coordinator']
    },
    {
      id: 'grants', title: 'Grant Report', icon: Award, color: '#8b5cf6',
      description: 'Grant applications, funding sources, amounts, and approval statuses.',
      roles: ['director', 'coordinator', 'finance']
    },
    {
      id: 'budget-utilization', title: 'Budget Utilization Report', icon: DollarSign, color: '#f59e0b',
      description: 'Budget allocation vs. actual expenses, utilization rates per project.',
      roles: ['director', 'finance']
    },
    {
      id: 'faculty-productivity', title: 'Faculty Productivity Report', icon: Users, color: '#06b6d4',
      description: 'Research productivity per faculty member: publications, projects, grants, and citations.',
      roles: ['director', 'coordinator']
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(card.id, 'pdf')} style={{ flex: 1, justifyContent: 'center', background: '#e11d48' }}>
                PDF
              </button>
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(card.id, 'excel')} style={{ flex: 1, justifyContent: 'center', background: '#16a34a' }}>
                Excel
              </button>
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(card.id, 'csv')} style={{ flex: 1, justifyContent: 'center' }}>
                CSV
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => handlePreview(card.id)} style={{ flex: '1 0 100%', justifyContent: 'center', marginTop: '4px' }}>
                <PieChart size={14} /> Preview Data
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
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(activeReport, 'pdf')} style={{ background: '#e11d48' }}>PDF</button>
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(activeReport, 'excel')} style={{ background: '#16a34a' }}>Excel</button>
              <button className="btn btn-sm btn-primary" onClick={() => handleDownload(activeReport, 'csv')}>CSV</button>
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
                      {Object.keys(reportData[0] || {}).map((key, j) => {
                        const val = row[key];
                        return (
                          <td key={j} style={{ fontSize: '0.82rem' }}>
                            {val === null || val === undefined ? '-' : 
                             (typeof val === 'object' ? JSON.stringify(val) : val.toString())}
                          </td>
                        );
                      })}
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
