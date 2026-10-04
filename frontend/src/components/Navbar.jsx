import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User, LogOut, Search, ShieldCheck } from 'lucide-react';

export const Navbar = ({ activeTab, toggleSidebar }) => {
  const { user, isAdmin, logout } = useAuth();

  const titleMap = {
    dashboard: 'Dashboard & Analytics',
    leads: 'Leads Management Workspace',
    users: 'Sales Team Management',
  };

  return (
    <header className="navbar navbar-expand bg-white border-bottom shadow-sm px-4 py-2 sticky-top">
      <div className="container-fluid p-0 d-flex align-items-center justify-content-between">
        {/* Left: Sidebar Toggle Button & Page Title */}
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-light btn-sm border-0 p-2 rounded-3 text-secondary hover-primary"
            onClick={toggleSidebar}
            title="Toggle Sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="d-none d-sm-block">
            <h5 className="fw-bold mb-0 text-dark leading-tight">{titleMap[activeTab] || 'Workspace'}</h5>
            <span className="text-muted small" style={{ fontSize: '11px' }}>
              Welcome back, <strong className="text-dark">{user?.name}</strong> 👋
            </span>
          </div>
        </div>

        {/* Right: Quick User Info & Actions */}
        <div className="d-flex align-items-center gap-3">
          {/* User Profile Pill */}
          <div className="d-flex align-items-center gap-2 bg-light border px-3 py-1.5 rounded-pill shadow-2xs">
            <div className={`p-1.5 rounded-circle ${isAdmin ? 'bg-danger text-white' : 'bg-info text-white'}`}>
              <User size={14} />
            </div>
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold text-dark small" style={{ fontSize: '13px' }}>{user?.name}</span>
              <span className="text-muted text-uppercase" style={{ fontSize: '10px' }}>
                {user?.role === 'admin' ? 'System Admin' : 'Sales Representative'}
              </span>
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            className="btn btn-outline-danger btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5"
            onClick={logout}
            title="Sign Out"
          >
            <LogOut size={14} />
            <span className="d-none d-md-inline small fw-semibold">Exit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
