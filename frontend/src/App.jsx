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
  
  // Current pathname tracking
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);
  const [activeTab, setActiveTab] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    if (path === 'leads') return 'leads';
    if (path === 'users') return 'users';
    return 'dashboard';
  });

  // Sync URL changes and popstate (back/forward browser buttons)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      const tab = path.replace('/', '');
      if (['dashboard', 'leads', 'users'].includes(tab)) {
        setActiveTab(tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL when user logs in or switches tabs
  useEffect(() => {
    if (!user) {
      if (currentPath === '/login' || currentPath === '/admin' || currentPath === '/dashboard') {
        if (window.location.pathname !== '/login') {
          window.history.replaceState({}, '', '/login');
          setCurrentPath('/login');
        }
      }
    } else {
      if (currentPath === '/login' || currentPath === '/admin' || currentPath === '/' || currentPath === '') {
        const targetPath = `/${activeTab}`;
        window.history.replaceState({}, '', targetPath);
        setCurrentPath(targetPath);
      }
    }
  }, [user, activeTab, currentPath]);

  const changeTab = (tab) => {
    setActiveTab(tab);
    const targetPath = `/${tab}`;
    window.history.pushState({}, '', targetPath);
    setCurrentPath(targetPath);
  };

  const goToAdminPortal = () => {
    if (user) {
      const targetPath = `/${activeTab}`;
      window.history.pushState({}, '', targetPath);
      setCurrentPath(targetPath);
    } else {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
  };

  const goToPublicEnquiry = () => {
    window.history.pushState({}, '', '/');
    setCurrentPath('/');
  };

  // 1. Public Website Enquiry Form at '/'
  if (currentPath === '/' || currentPath === '') {
    return <PublicEnquiryForm onGoToAdmin={goToAdminPortal} />;
  }

  // 2. Login Page at '/login' (when not authenticated)
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

  // 3. Authenticated CRM Panel at '/dashboard', '/leads', '/users'
  return (
    <Layout activeTab={activeTab} setActiveTab={changeTab}>
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
