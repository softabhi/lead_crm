import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertTriangle, CheckCircle, X } from 'lucide-react';

export const CreateLeadModal = ({ show, onClose, onLeadCreated }) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    status: 'New',
    assigned_user_id: '',
  });

  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  useEffect(() => {
    if (show && isAdmin) {
      api.getUsers('sales_user', true)
        .then((res) => setSalesUsers(res.data || []))
        .catch(() => {});
    }
  }, [show, isAdmin]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      const payload = {
        ...formData,
        assigned_user_id: formData.assigned_user_id ? parseInt(formData.assigned_user_id) : null,
      };

      const res = await api.createLead(payload);

      if (res.duplicate_warning) {
        setDuplicateWarning(res.duplicate_warning);
      }

      onLeadCreated(res.data, res.duplicate_warning);

      if (!res.duplicate_warning) {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create lead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-primary text-white border-0 px-4 py-3">
            <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
              <UserPlus size={22} />
              <span>Capture New Lead</span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {error && (
              <div className="alert alert-danger rounded-3 small mb-3">
                {error}
              </div>
            )}

            {duplicateWarning && (
              <div className="alert alert-warning d-flex align-items-start gap-2 rounded-3 small mb-3">
                <AlertTriangle size={20} className="flex-shrink-0 text-warning" />
                <div>
                  <strong>Duplicate Flagged:</strong> {duplicateWarning}
                  <div className="mt-1 text-dark">Lead created successfully despite duplicate match.</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Lead Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Acme Corporation"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Phone Number *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. client@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Lead Source</label>
                  <select
                    className="form-select"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small">Initial Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Follow-up">Follow-up</option>
                  </select>
                </div>

                {isAdmin && (
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Assign Salesperson</label>
                    <select
                      className="form-select"
                      value={formData.assigned_user_id}
                      onChange={(e) => setFormData({ ...formData, assigned_user_id: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {salesUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary px-4 rounded-2" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 rounded-2 fw-semibold" disabled={loading}>
                  {loading ? 'Creating...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
