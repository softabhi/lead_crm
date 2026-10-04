import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { UserCheck, UserPlus, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New User Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'sales_user' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user) => {
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.toggleUserStatus(user.id);
      setSuccessMsg(res.message);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to toggle user status.');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await api.createUser(newUser);
      setSuccessMsg(`User ${newUser.name} created successfully.`);
      setNewUser({ name: '', email: '', password: '', role: 'sales_user' });
      setShowAddForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.message || 'Failed to create user account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-fluid px-4 py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Sales Team & User Management</h2>
          <p className="text-secondary small mb-0">Create, manage, and toggle active status for sales team members.</p>
        </div>

        <button
          className="btn btn-primary d-flex align-items-center gap-2 rounded-3 shadow-sm px-3"
          onClick={() => setShowAddForm(true)}
        >
          <UserPlus size={18} />
          <span>Create New User</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 small mb-3">{error}</div>
      )}

      {successMsg && (
        <div className="alert alert-success rounded-3 small mb-3">{successMsg}</div>
      )}

      {/* Add User Modal / Form */}
      {showAddForm && (
        <div className="card shadow-sm border-0 rounded-4 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">Add New Sales User</h5>
            <form onSubmit={handleCreateUser}>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Email Address *</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="john@crm.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Password *</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">User Role</label>
                  <select
                    className="form-select"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="sales_user">Sales User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-3 text-end d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-outline-secondary px-3" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary px-4 fw-semibold" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List Table */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-uppercase small text-muted">
                  <tr>
                    <th className="ps-4">User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th className="text-end pe-4">Toggle Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-4 fw-bold text-dark">{u.name}</td>
                      <td className="text-secondary small">{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'bg-danger' : 'bg-info'} text-uppercase`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        {u.is_active ? (
                          <span className="badge bg-success-subtle text-success border border-success border-opacity-25 px-2.5 py-1">
                            Active
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger border border-danger border-opacity-25 px-2.5 py-1">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="text-muted small">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-end pe-4">
                        <button
                          className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'} rounded-2 px-3`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
