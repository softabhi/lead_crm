import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { LeadList } from './components/LeadList';
import { UserManagement } from './components/UserManagement';
import { PublicEnquiryForm } from './components/PublicEnquiryForm';

const MainApp = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // URL Path Routing: '/' = Public Enquiry Form, '/admin' = Admin/Staff CRM Portal
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin');
  });

  useEffect(() => {
    const handlePopState = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToAdminPortal = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
  };

  const goToPublicEnquiry = () => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
  };

  // If user is on main index route ('/'), render Public Lead Enquiry Form
  if (!isAdminRoute) {
    return <PublicEnquiryForm onGoToAdmin={goToAdminPortal} />;
  }

  // If user is on '/admin' route and not logged in, render Admin/Staff Login
  if (!user) {
    return (
      <div className="min-vh-100 bg-light d-flex flex-column">
        <div className="bg-dark py-2 px-4 text-end">
          <button
            className="btn btn-link text-light btn-sm text-decoration-none"
            onClick={goToPublicEnquiry}
          >
            ← Back to Public Website Enquiry Form
          </button>
        </div>
        <Login />
      </div>
    );
  }

  // Logged-in Admin / Sales Representative Dashboard Workspace
  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'leads' && <LeadList />}
      {activeTab === 'users' && <UserManagement />}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
