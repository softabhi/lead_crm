import React, { useState } from 'react';
import { api } from '../services/api';
import { Briefcase, Send, CheckCircle, Lock, Mail, Phone, User, MessageSquare, ArrowRight } from 'lucide-react';

export const PublicEnquiryForm = ({ onGoToAdmin }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website Form',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await api.submitPublicEnquiry(formData);
      setSuccess(res.message || 'Your enquiry has been received successfully!');
      setFormData({
        name: '',
        phone: '',
        email: '',
        source: 'Website Form',
        message: '',
      });
    } catch (err) {
      setError(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex flex-column">
      {/* Public Header Navbar */}
      <header className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3 px-4">
        <div className="container-fluid max-w-6xl">
          <a className="navbar-brand d-flex align-items-center gap-2 fw-bold text-primary fs-4" href="/">
            <Briefcase className="text-primary" size={28} />
            <span>Lead<span className="text-light">CRM</span></span>
          </a>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-light btn-sm rounded-pill px-3 py-2 d-flex align-items-center gap-2"
              onClick={onGoToAdmin}
            >
              <Lock size={16} />
              <span>Admin & Staff Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow-1 container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="text-center mb-5">
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
                Public Inquiry Desk
              </span>
              <h2 className="display-6 fw-bold text-dark mb-2">Get in Touch With Our Sales Team</h2>
              <p className="text-secondary lead mx-auto" style={{ maxWidth: '600px' }}>
                Fill out the form below to request information or inquire about our services. A sales specialist will respond promptly.
              </p>
            </div>

            <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="card-body p-4 p-md-5 bg-white">
                {success && (
                  <div className="alert alert-success d-flex align-items-center gap-3 rounded-4 p-4 mb-4" role="alert">
                    <CheckCircle size={32} className="flex-shrink-0 text-success" />
                    <div>
                      <h5 className="fw-bold mb-1">Enquiry Submitted!</h5>
                      <p className="mb-0 small text-success-emphasis">{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger rounded-3 small mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Your Full Name *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <User size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-light border-start-0 ps-0"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Phone Number *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <Phone size={18} />
                        </span>
                        <input
                          type="text"
                          className="form-control bg-light border-start-0 ps-0"
                          placeholder="+91 9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">Email Address *</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary">
                          <Mail size={18} />
                        </span>
                        <input
                          type="email"
                          className="form-control bg-light border-start-0 ps-0"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="form-label fw-semibold text-dark small">How Did You Find Us?</label>
                      <select
                        className="form-select bg-light"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      >
                        <option value="Website Form">Website Search</option>
                        <option value="Referral">Friend / Client Referral</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Google Search">Google Advertisement</option>
                        <option value="Other">Other Channel</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small">Your Message / Requirement Details</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-secondary align-items-start pt-2">
                          <MessageSquare size={18} />
                        </span>
                        <textarea
                          className="form-control bg-light border-start-0 ps-0"
                          rows="4"
                          placeholder="Tell us about your requirements or questions..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-2">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 rounded-3 shadow-sm"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="spinner-border spinner-border-sm text-light" role="status">
                          <span className="visually-hidden">Submitting...</span>
                        </div>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-top py-3 text-center text-muted small">
        Lead Management System © {new Date().getFullYear()} • Enterprise Sales CRM
      </footer>
    </div>
  );
};
