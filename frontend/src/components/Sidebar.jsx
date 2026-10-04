import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserCheck, LogOut, Briefcase, Shield, ChevronRight, Settings
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads', label: 'Leads Workspace', icon: Users },
    ...(isAdmin ? [{ id: 'users', label: 'Sales Team', icon: UserCheck }] : []),
  ];

  return (
    <aside
      className={`bg-dark text-white d-flex flex-column flex-shrink-0 p-3 shadow-lg transition-all ${
        isOpen ? 'sidebar-open' : 'sidebar-closed'
      }`}
      style={{
        width: isOpen ? '260px' : '75px',
        minHeight: '100vh',
        transition: 'width 0.25s ease-in-out',
        position: 'sticky',
        top: 0,
        zIndex: 1020,
      }}
    >
      {/* Brand Header */}
      <div className="d-flex align-items-center justify-content-between pb-3 mb-3 border-bottom border-secondary border-opacity-25 px-2">
        <a
          href="#dashboard"
          onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
          className="d-flex align-items-center gap-3 text-white text-decoration-none"
        >
          <div className="bg-primary p-2 rounded-3 text-white d-flex align-items-center justify-content-center">
            <Briefcase size={22} />
          </div>
          {isOpen && (
            <div className="d-flex flex-column">
              <span className="fw-bold fs-5 leading-tight">Lead<span className="text-primary">CRM</span></span>
              <span className="text-secondary small" style={{ fontSize: '10px' }}>Enterprise Edition</span>
            </div>
          )}
        </a>
      </div>

      {/* Role Indicator Badge */}
      {isOpen && (
        <div className="px-2 mb-3">
          <div className="bg-secondary bg-opacity-25 border border-secondary border-opacity-25 rounded-3 p-2 d-flex align-items-center gap-2">
            <Shield size={16} className={isAdmin ? 'text-danger' : 'text-info'} />
            <div className="d-flex flex-column overflow-hidden">
              <span className="fw-semibold text-truncate small text-light">{user?.name}</span>
              <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-info'} align-self-start text-uppercase`} style={{ fontSize: '9px' }}>
                {isAdmin ? 'Administrator' : 'Sales Representative'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column mb-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link w-100 d-flex align-items-center gap-3 px-3 py-2.5 rounded-3 border-0 text-start ${
                  isActive ? 'active bg-primary text-white shadow-sm' : 'text-secondary hover-white bg-transparent'
                }`}
                onClick={() => setActiveTab(item.id)}
                title={!isOpen ? item.label : ''}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-secondary'} />
                {isOpen && (
                  <span className="fw-medium small flex-grow-1">{item.label}</span>
                )}
                {isOpen && isActive && <ChevronRight size={16} className="text-white-50" />}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer / Logout */}
      <div className="pt-3 border-top border-secondary border-opacity-25">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3"
          onClick={logout}
          title="Sign Out"
        >
          <LogOut size={18} />
          {isOpen && <span className="fw-semibold small">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
