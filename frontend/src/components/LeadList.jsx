import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CreateLeadModal } from './CreateLeadModal';
import { LeadDetailsModal } from './LeadDetailsModal';
import {
  Search, Filter, Plus, ChevronLeft, ChevronRight, RefreshCw,
  User, Phone, Mail, Calendar, Eye, AlertTriangle
} from 'lucide-react';

export const LeadList = () => {
  const { user, isAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [salespersonFilter, setSalespersonFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [duplicateBanner, setDuplicateBanner] = useState(null);

  const fetchLeads = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        search,
        status: statusFilter,
        source: sourceFilter,
        assigned_user_id: salespersonFilter,
        date_from: dateFrom,
        date_to: dateTo,
      };

      const res = await api.getLeads(params);
      setLeads(res.data || []);
      setCurrentPage(res.current_page || 1);
      setLastPage(res.last_page || 1);
      setTotalLeads(res.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(1);
    if (isAdmin) {
      api.getUsers('sales_user')
        .then((res) => setSalesUsers(res.data || []))
        .catch(() => {});
    }
  }, [statusFilter, sourceFilter, salespersonFilter, dateFrom, dateTo, isAdmin]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLeads(1);
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setSourceFilter('');
    setSalespersonFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const handleLeadCreated = (newLead, warning) => {
    if (warning) {
      setDuplicateBanner(warning);
    }
    fetchLeads(1);
  };

  const statusBadgeColors = {
    New: 'bg-primary',
    Contacted: 'bg-info text-dark',
    Interested: 'bg-warning text-dark',
    'Follow-up': 'bg-secondary',
    Converted: 'bg-success',
    Lost: 'bg-danger',
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h2 className="fw-bold mb-1">Lead Management Workspace</h2>
          <p className="text-secondary small mb-0">
            {isAdmin
              ? `Manage and assign all ${totalLeads} organization leads across sales reps.`
              : `View and update your ${totalLeads} assigned leads.`}
          </p>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-3"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            <span>Create New Lead</span>
          </button>
        </div>
      </div>

      {/* Duplicate Alert Banner */}
      {duplicateBanner && (
        <div className="alert alert-warning alert-dismissible fade show d-flex align-items-center gap-2 rounded-3 mb-4" role="alert">
          <AlertTriangle size={20} className="flex-shrink-0 text-warning" />
          <div>
            <strong>Lead Created with Warning:</strong> {duplicateBanner}
          </div>
          <button type="button" className="btn-close" onClick={() => setDuplicateBanner(null)}></button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-3 p-md-4">
          <form onSubmit={handleSearchSubmit}>
            <div className="row g-3">
              {/* Search Box */}
              <div className="col-12 col-md-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Search name, phone, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button type="submit" className="btn btn-outline-secondary">Search</button>
                </div>
              </div>

              {/* Status Filter */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select bg-light"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Converted">Converted</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Source Filter */}
              <div className="col-6 col-md-2">
                <select
                  className="form-select bg-light"
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  <option value="">All Sources</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
              </div>

              {/* Salesperson Filter (Admin only) */}
              {isAdmin && (
                <div className="col-6 col-md-2">
                  <select
                    className="form-select bg-light"
                    value={salespersonFilter}
                    onChange={(e) => setSalespersonFilter(e.target.value)}
                  >
                    <option value="">All Salespeople</option>
                    <option value="unassigned">Unassigned</option>
                    {salesUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Filters */}
              <div className="col-6 col-md-2 text-end ms-auto">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none text-secondary d-flex align-items-center gap-1 justify-content-end"
                  onClick={handleResetFilters}
                >
                  <RefreshCw size={14} /> Clear Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {error && (
            <div className="alert alert-danger m-3 small">{error}</div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading leads...</span>
              </div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-1 fw-semibold">No leads found matching your search criteria.</p>
              <small>Try clearing filters or creating a new lead.</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th className="ps-4">Lead ID</th>
                    <th>Lead Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created Date</th>
                    <th className="text-end pe-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="ps-4">
                        <span className="badge bg-secondary bg-opacity-10 text-dark border border-secondary border-opacity-25 font-monospace fw-bold px-2 py-1">
                          #{lead.id}
                        </span>
                      </td>
                      <td>
                        <span
                          className="fw-bold text-dark text-decoration-none cursor-pointer hover-primary"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setShowDetailsModal(true);
                          }}
                        >
                          {lead.name}
                        </span>
                      </td>
                      <td>
                        <span className="text-secondary small font-monospace">{lead.phone}</span>
                      </td>
                      <td>
                        <span className="text-secondary small">{lead.email}</span>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-normal">{lead.source}</span>
                      </td>
                      <td>
                        <span className={`badge ${statusBadgeColors[lead.status] || 'bg-secondary'} px-3 py-1.5 rounded-pill`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>
                        {lead.assigned_user ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary fw-semibold border border-primary border-opacity-25 px-2.5 py-1">
                            👤 {lead.assigned_user.name}
                          </span>
                        ) : (
                          <span className="badge bg-warning bg-opacity-10 text-warning fw-semibold border border-warning border-opacity-25 px-2.5 py-1">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-muted small">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className="btn btn-sm btn-outline-primary rounded-2 px-3 d-inline-flex align-items-center gap-1"
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye size={14} /> View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {lastPage > 1 && (
          <div className="card-footer bg-white border-0 px-4 py-3 d-flex justify-content-between align-items-center">
            <span className="text-secondary small">
              Page {currentPage} of {lastPage} ({totalLeads} total leads)
            </span>

            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-2"
                disabled={currentPage <= 1}
                onClick={() => fetchLeads(currentPage - 1)}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 rounded-2"
                disabled={currentPage >= lastPage}
                onClick={() => fetchLeads(currentPage + 1)}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateLeadModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLeadCreated={handleLeadCreated}
      />

      <LeadDetailsModal
        leadId={selectedLeadId}
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={() => fetchLeads(currentPage)}
      />
    </div>
  );
};
