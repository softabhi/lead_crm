import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User, Phone, Mail, Globe, Calendar, Clock, Edit3, UserCheck,
  MessageSquare, FileText, CheckCircle, AlertCircle, ArrowRight
} from 'lucide-react';

export const LeadDetailsModal = ({ leadId, show, onClose, onLeadUpdated }) => {
  const { user, isAdmin } = useAuth();
  const [lead, setLead] = useState(null);
  const [history, setHistory] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, reassign, note

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Forms
  const [status, setStatus] = useState('');
  const [reassignUserId, setReassignUserId] = useState('');
  const [reassignReason, setReassignReason] = useState('');
  const [noteText, setNoteText] = useState('');

  // Editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', source: '' });

  const fetchDetails = async () => {
    if (!leadId) return;
    setLoading(true);
    setError(null);
    try {
      const [leadRes, historyRes] = await Promise.all([
        api.getLeadDetails(leadId),
        api.getLeadHistory(leadId),
      ]);

      const leadData = leadRes.data;
      setLead(leadData);
      setStatus(leadData.status);
      setReassignUserId(leadData.assigned_user_id || '');
      setEditForm({
        name: leadData.name,
        phone: leadData.phone,
        email: leadData.email,
        source: leadData.source,
      });

      setHistory(historyRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load lead details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && leadId) {
      fetchDetails();
      if (isAdmin) {
        api.getUsers('sales_user', true)
          .then((res) => setSalesUsers(res.data || []))
          .catch(() => {});
      }
    }
  }, [show, leadId, isAdmin]);

  if (!show) return null;

  const handleStatusChange = async (newStatus) => {
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.updateLeadStatus(leadId, newStatus);
      setStatus(newStatus);
      setLead(res.data);
      setSuccessMsg(`Status updated to '${newStatus}'`);
      onLeadUpdated(res.data);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Invalid status transition.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassign = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const targetId = reassignUserId ? parseInt(reassignUserId) : null;
      const res = await api.assignLead(leadId, targetId, reassignReason);
      setLead(res.data);
      setSuccessMsg('Lead reassigned successfully.');
      onLeadUpdated(res.data);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to reassign lead.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.addLeadNote(leadId, noteText);
      setNoteText('');
      setSuccessMsg('Note added to activity history.');
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to add note.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLeadInfo = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.updateLead(leadId, editForm);
      setLead(res.data);
      setIsEditing(false);
      setSuccessMsg('Lead contact details updated.');
      onLeadUpdated(res.data);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to update lead details.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = ['New', 'Contacted', 'Interested', 'Follow-up', 'Converted', 'Lost'];

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 px-4 py-3">
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-25 p-2 rounded-3 text-primary">
                <User size={24} />
              </div>
              <div>
                <h5 className="modal-title fw-bold mb-0">{lead?.name || 'Lead Details'}</h5>
                <span className="text-secondary small">ID: #{lead?.id} • Source: {lead?.source}</span>
              </div>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* Subnav Tabs */}
          <div className="bg-light border-bottom px-4 pt-2">
            <ul className="nav nav-tabs border-0 gap-2">
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold px-3 ${activeTab === 'overview' ? 'active bg-white text-primary border-bottom border-primary border-2' : 'text-secondary'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview & Contact Info
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold px-3 ${activeTab === 'timeline' ? 'active bg-white text-primary border-bottom border-primary border-2' : 'text-secondary'}`}
                  onClick={() => setActiveTab('timeline')}
                >
                  Activity History & Timeline ({history.length})
                </button>
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <button
                    className={`nav-link border-0 fw-semibold px-3 ${activeTab === 'reassign' ? 'active bg-white text-primary border-bottom border-primary border-2' : 'text-secondary'}`}
                    onClick={() => setActiveTab('reassign')}
                  >
                    Reassign Lead
                  </button>
                </li>
              )}
              <li className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold px-3 ${activeTab === 'note' ? 'active bg-white text-primary border-bottom border-primary border-2' : 'text-secondary'}`}
                  onClick={() => setActiveTab('note')}
                >
                  Add Note / Activity
                </button>
              </li>
            </ul>
          </div>

          <div className="modal-body p-4" style={{ minHeight: '400px', maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
              <div className="alert alert-danger rounded-3 small mb-3 d-flex align-items-center gap-2">
                <AlertCircle size={18} />
                <div>{error}</div>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success rounded-3 small mb-3 d-flex align-items-center gap-2">
                <CheckCircle size={18} />
                <div>{successMsg}</div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <>
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div className="row g-4">
                    <div className="col-12 col-md-7">
                      <div className="card border rounded-3 p-4 h-100 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h6 className="fw-bold text-dark mb-0">Contact Information</h6>
                          {!isEditing ? (
                            <button
                              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 rounded-2"
                              onClick={() => setIsEditing(true)}
                            >
                              <Edit3 size={14} /> Edit Info
                            </button>
                          ) : (
                            <button className="btn btn-link btn-sm text-secondary" onClick={() => setIsEditing(false)}>
                              Cancel
                            </button>
                          )}
                        </div>

                        {!isEditing ? (
                          <div className="row g-3">
                            <div className="col-6">
                              <span className="text-muted small d-block">Full Name</span>
                              <span className="fw-semibold text-dark">{lead?.name}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Phone Number</span>
                              <span className="fw-semibold text-dark">{lead?.phone}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Email Address</span>
                              <span className="fw-semibold text-dark">{lead?.email}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Lead Source</span>
                              <span className="badge bg-light text-dark border">{lead?.source}</span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Assigned To</span>
                              <span className="fw-semibold text-primary">
                                {lead?.assigned_user ? lead.assigned_user.name : 'Unassigned'}
                              </span>
                            </div>
                            <div className="col-6">
                              <span className="text-muted small d-block">Created On</span>
                              <span className="text-secondary small">
                                {new Date(lead?.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <form onSubmit={handleUpdateLeadInfo}>
                            <div className="row g-3">
                              <div className="col-6">
                                <label className="form-label small fw-semibold">Name</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-semibold">Phone</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editForm.phone}
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-semibold">Email</label>
                                <input
                                  type="email"
                                  className="form-control form-control-sm"
                                  value={editForm.email}
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-semibold">Source</label>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={editForm.source}
                                  onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                                />
                              </div>
                              <div className="col-12 mt-3 text-end">
                                <button type="submit" className="btn btn-primary btn-sm px-3 rounded-2" disabled={submitting}>
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>

                    <div className="col-12 col-md-5">
                      <div className="card border rounded-3 p-4 h-100 shadow-sm bg-light">
                        <h6 className="fw-bold text-dark mb-3">Lead Lifecycle Status</h6>
                        <div className="mb-3">
                          <span className="text-muted small d-block mb-1">Current Status</span>
                          <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill">{lead?.status}</span>
                        </div>

                        <label className="form-label small fw-semibold text-secondary">Change Status</label>
                        <div className="d-flex flex-wrap gap-2">
                          {statusOptions.map((st) => (
                            <button
                              key={st}
                              type="button"
                              className={`btn btn-sm rounded-pill px-3 ${lead?.status === st ? 'btn-primary' : 'btn-outline-secondary bg-white'}`}
                              onClick={() => handleStatusChange(st)}
                              disabled={submitting}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                        <small className="text-muted d-block mt-3">
                          * Status transitions are validated based on CRM lifecycle rules.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: AUDIT TIMELINE */}
                {activeTab === 'timeline' && (
                  <div>
                    <h6 className="fw-bold mb-3">Chronological Activity History</h6>
                    {history.length === 0 ? (
                      <p className="text-muted small">No activity recorded yet.</p>
                    ) : (
                      <div className="timeline ps-3 border-start border-2 border-primary">
                        {history.map((act) => (
                          <div key={act.id} className="mb-4 position-relative ps-4">
                            <div
                              className="position-absolute rounded-circle bg-primary"
                              style={{ left: '-21px', top: '2px', width: '12px', height: '12px' }}
                            ></div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold text-dark small">
                                {act.user ? act.user.name : 'System'}
                                <span className="badge bg-light text-secondary border ms-2 text-uppercase" style={{ fontSize: '10px' }}>
                                  {act.activity_type}
                                </span>
                              </span>
                              <span className="text-muted small">
                                {new Date(act.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-secondary small mb-1 mt-1">{act.description}</p>
                            {act.old_values && (
                              <div className="bg-light p-2 rounded border small text-muted font-monospace mt-1" style={{ fontSize: '11px' }}>
                                Diff: {JSON.stringify(act.old_values)} → {JSON.stringify(act.new_values)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: REASSIGN */}
                {activeTab === 'reassign' && isAdmin && (
                  <div className="max-w-lg">
                    <h6 className="fw-bold mb-3">Reassign Lead Ownership</h6>
                    <form onSubmit={handleReassign}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Target Salesperson</label>
                        <select
                          className="form-select"
                          value={reassignUserId}
                          onChange={(e) => setReassignUserId(e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {salesUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Reassignment Reason / Note</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          placeholder="e.g. Lead requested dedicated agent / load distribution..."
                          value={reassignReason}
                          onChange={(e) => setReassignReason(e.target.value)}
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary rounded-2 px-4" disabled={submitting}>
                        {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 4: ADD NOTE */}
                {activeTab === 'note' && (
                  <div>
                    <h6 className="fw-bold mb-3">Add Note / Log Activity</h6>
                    <form onSubmit={handleAddNote}>
                      <div className="mb-3">
                        <textarea
                          className="form-control"
                          rows="4"
                          placeholder="Type meeting notes, callback details, customer feedback..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          required
                        ></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary rounded-2 px-4" disabled={submitting}>
                        {submitting ? 'Saving Note...' : 'Save Activity Note'}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer bg-light border-0 px-4 py-3">
            <button type="button" className="btn btn-secondary px-4 rounded-2" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
