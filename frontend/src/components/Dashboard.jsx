import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, CheckCircle, XCircle, RefreshCw, ArrowUpRight, Award, PieChart } from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getDashboardStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5 min-vh-50">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading metrics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger rounded-4 m-4 d-flex justify-content-between align-items-center">
        <div>{error}</div>
        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={fetchStats}>
          Retry
        </button>
      </div>
    );
  }

  const statusColors = {
    New: 'primary',
    Contacted: 'info',
    Interested: 'warning',
    'Follow-up': 'secondary',
    Converted: 'success',
    Lost: 'danger',
  };

  return (
    <div className="container-fluid w-100 px-4 py-4">
      {/* Top Controls Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold mb-1 text-dark">Executive Analytics Overview</h3>
          <p className="text-secondary small mb-0">
            {isAdmin
              ? 'Real-time organization metrics, lead statuses, and sales performance breakdown.'
              : `Personal lead performance metrics for ${user?.name}.`}
          </p>
        </div>
        <button className="btn btn-white border shadow-2xs btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-secondary hover-primary" onClick={fetchStats}>
          <RefreshCw size={16} />
          <span className="fw-semibold small">Refresh Statistics</span>
        </button>
      </div>

      {/* KPI Metric Cards - Full Width Row */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-4 bg-primary text-white h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="text-white-50 text-uppercase fw-bold small" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Total Leads</span>
                  <h1 className="display-5 fw-bold mb-0 mt-1 text-white">{stats?.total_leads || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-4 text-white">
                  <Users size={28} />
                </div>
              </div>
              <div className="text-white-50 small d-flex align-items-center gap-1">
                <ArrowUpRight size={16} /> <span>Captured in CRM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-4 bg-info text-white h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="text-white-50 text-uppercase fw-bold small" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>New Inquiries</span>
                  <h1 className="display-5 fw-bold mb-0 mt-1 text-white">{stats?.new_leads || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-4 text-white">
                  <UserPlus size={28} />
                </div>
              </div>
              <div className="text-white-50 small d-flex align-items-center gap-1">
                <span>Awaiting follow-up action</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-4 bg-success text-white h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="text-white-50 text-uppercase fw-bold small" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Converted Deals</span>
                  <h1 className="display-5 fw-bold mb-0 mt-1 text-white">{stats?.converted_leads || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-4 text-white">
                  <CheckCircle size={28} />
                </div>
              </div>
              <div className="text-white-50 small fw-semibold">
                🎯 {stats?.conversion_rate}% Overall Conversion Rate
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="card shadow-sm border-0 rounded-4 bg-danger text-white h-100 position-relative overflow-hidden">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="text-white-50 text-uppercase fw-bold small" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>Lost Opportunities</span>
                  <h1 className="display-5 fw-bold mb-0 mt-1 text-white">{stats?.lost_leads || 0}</h1>
                </div>
                <div className="bg-white bg-opacity-20 p-3 rounded-4 text-white">
                  <XCircle size={28} />
                </div>
              </div>
              <div className="text-white-50 small">
                Closed / Unqualified leads
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Status Breakdown & Team Table (Full Width Layout) */}
      <div className="row g-4">
        {/* Status Lifecycle Progress Breakdown */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 h-100 bg-white">
            <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                  <PieChart size={20} className="text-primary" />
                  <span>Lead Pipeline Status Distribution</span>
                </h5>
                <span className="badge bg-light text-secondary border px-3 py-1.5 rounded-pill small">
                  Total: {stats?.total_leads || 0} Leads
                </span>
              </div>
            </div>
            <div className="card-body p-4">
              {Object.entries(stats?.leads_by_status || {}).map(([status, count]) => {
                const percentage = stats?.total_leads ? Math.round((count / stats.total_leads) * 100) : 0;
                const badgeColor = statusColors[status] || 'secondary';

                return (
                  <div key={status} className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge bg-${badgeColor} px-3 py-1.5 rounded-pill fw-semibold`}>
                          {status}
                        </span>
                        <span className="fw-bold text-dark">{count} Leads</span>
                      </div>
                      <span className="fw-bold text-primary">{percentage}%</span>
                    </div>
                    <div className="progress rounded-pill bg-light" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar bg-${badgeColor} rounded-pill transition-all`}
                        role="progressbar"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sales Team Distribution (Admin Overview) */}
        {isAdmin && (
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm border-0 rounded-4 h-100 bg-white">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2 text-dark">
                  <Award size={20} className="text-success" />
                  <span>Sales Representative Distribution</span>
                </h5>
              </div>
              <div className="card-body p-4">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0 border-top-0">
                    <thead className="table-light text-uppercase small text-muted">
                      <tr>
                        <th className="border-0">Sales Representative</th>
                        <th className="border-0">Email</th>
                        <th className="border-0 text-center">Active Leads</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.leads_by_salesperson?.map((person, idx) => (
                        <tr key={person.id ?? `unassigned-${idx}`}>
                          <td className="fw-bold text-dark">{person.name}</td>
                          <td className="text-muted small">{person.email || '—'}</td>
                          <td className="text-center">
                            <span className={`badge rounded-pill px-3 py-2 ${person.id ? 'bg-primary' : 'bg-warning text-dark'}`}>
                              {person.assigned_count} Leads
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
