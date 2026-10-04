// API Client Service for Lead Management Backend

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('crm_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('crm_token');
      localStorage.removeItem('crm_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorMsg = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'An error occurred');
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth APIs
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  submitPublicEnquiry: async (enquiryData) => {
    const res = await fetch(`${API_BASE}/public/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(enquiryData),
    });
    return handleResponse(res);
  },

  logout: async () => {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/me`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // Dashboard API
  getDashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },

  // User Management APIs
  getUsers: async (role = '', activeOnly = false) => {
    const query = new URLSearchParams();
    if (role) query.append('role', role);
    if (activeOnly) query.append('active_only', '1');
    
    const res = await fetch(`${API_BASE}/users?${query.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  toggleUserStatus: async (userId) => {
    const res = await fetch(`${API_BASE}/users/${userId}/toggle-status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Lead APIs
  getLeads: async (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        query.append(key, params[key]);
      }
    });

    const res = await fetch(`${API_BASE}/leads?${query.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  createLead: async (leadData) => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(res);
  },

  getLeadDetails: async (leadId) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}`, { headers: getHeaders() });
    return handleResponse(res);
  },

  updateLead: async (leadId, leadData) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(res);
  },

  assignLead: async (leadId, assignedUserId, reason = '') => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ assigned_user_id: assignedUserId, reason }),
    });
    return handleResponse(res);
  },

  updateLeadStatus: async (leadId, status) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  addLeadNote: async (leadId, note) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ note }),
    });
    return handleResponse(res);
  },

  getLeadHistory: async (leadId) => {
    const res = await fetch(`${API_BASE}/leads/${leadId}/history`, { headers: getHeaders() });
    return handleResponse(res);
  },
};
