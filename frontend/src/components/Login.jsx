import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    setError(null);
  };

  return (
    <div className="container min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white p-4 text-center border-0">
              <div className="d-inline-flex p-3 bg-primary bg-opacity-25 rounded-circle text-primary mb-3">
                <Briefcase size={36} />
              </div>
              <h3 className="fw-bold mb-1">LeadManager CRM</h3>
              <p className="text-secondary small mb-0">Sign in to access your sales workspace</p>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 small" role="alert">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-secondary">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold text-secondary small">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-secondary">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-light border-start-0 ps-0"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="spinner-border spinner-border-sm text-light" role="status">
                      <span className="visually-hidden">Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to Dashboard</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Fill Demo Credentials */}
              <div className="mt-4 pt-3 border-top">
                <p className="text-muted small fw-semibold mb-2 text-center">Quick Demo Login Accounts:</p>
                <div className="d-flex flex-wrap gap-2 justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-dark btn-sm rounded-pill px-3"
                    onClick={() => fillDemoAccount('admin@crm.com')}
                  >
                    👑 Admin User
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm rounded-pill px-3"
                    onClick={() => fillDemoAccount('rahul@crm.com')}
                  >
                    👤 Rahul (Sales)
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success btn-sm rounded-pill px-3"
                    onClick={() => fillDemoAccount('priya@crm.com')}
                  >
                    👤 Priya (Sales)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
