import { useState, useEffect } from 'react';
import { budgetsAPI } from '../api/services';
import { Wallet, Search, PlusCircle, FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    budgetsAPI.getAll()
      .then(res => setBudgets(res.data))
      .catch(err => toast.error('Failed to load budgets'))
      .finally(() => setLoading(false));
  }, []);

  const calculateTotalExpenses = (expenses = []) => {
    return expenses.reduce((acc, curr) => acc + curr.amount, 0);
  };

  const filtered = budgets.filter(b => 
    b.project?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <Toaster position="top-right" />
      <div className="page-header">
        <h1 className="page-title">Financial Overview</h1>
        <p className="page-subtitle">Track project budgets, expenses, and remaining allocations.</p>
      </div>

      <div className="filters-bar" style={{ marginBottom: '24px' }}>
        <div className="search-input" style={{ width: '100%' }}>
          <Search className="search-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search budgets by project title..." 
            style={{ width: '100%', maxWidth: '400px' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="splash" style={{ minHeight: '300px', background: 'transparent' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Wallet className="empty-icon" />
            <div className="empty-title">No budget allocations found</div>
            <p>Approve a proposal to trigger initial budget formulation.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {filtered.map(b => {
            const expenditures = calculateTotalExpenses(b.expenses);
            const remaining = b.totalBudget - expenditures;
            const percentageUsed = Math.min((expenditures / b.totalBudget) * 100, 100).toFixed(1);
            
            return (
              <div className="card" key={b._id}>
                <div className="card-header" style={{ marginBottom: '16px' }}>
                  <h3 className="card-title" style={{ fontSize: '1.1rem' }}>{b.project?.title || 'Unknown Project'}</h3>
                  <button className="btn btn-sm btn-secondary"><PlusCircle size={14} /> Add Expense</button>
                </div>
                
                <div className="budget-summary">
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div className="stat-label">Total Allocated Budget</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>${b.totalBudget.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div className="stat-label">Total Expenditures</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--danger)' }}>${expenditures.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <div className="stat-label">Remaining Balance</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>${remaining.toLocaleString()}</div>
                  </div>
                </div>

                <div className="budget-meter">
                  <div className="budget-meter-labels">
                    <span>Budget Utilized: {percentageUsed}%</span>
                    <span>{b.expenses?.length || 0} Transactions</span>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', background: 'var(--bg-secondary)' }}>
                    <div className="progress-fill" style={{ width: `${percentageUsed}%`, background: percentageUsed > 85 ? 'var(--danger)' : percentageUsed > 50 ? 'var(--warning)' : 'var(--success)' }}></div>
                  </div>
                </div>

                {b.expenses && b.expenses.length > 0 && (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Recent Expenses</div>
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {b.expenses.slice(0, 3).map((exp, i) => (
                            <tr key={i}>
                              <td>{new Date(exp.date).toLocaleDateString()}</td>
                              <td>{exp.description}</td>
                              <td><span className="badge" style={{ background: 'var(--bg-secondary)' }}>{exp.category?.toUpperCase()}</span></td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>${exp.amount.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
