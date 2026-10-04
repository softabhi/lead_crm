import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const Layout = ({ activeTab, setActiveTab, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Left Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="d-flex flex-column flex-grow-1 overflow-hidden">
        {/* Top Navbar */}
        <Navbar activeTab={activeTab} toggleSidebar={toggleSidebar} />

        {/* Dynamic Page Content Area */}
        <main className="flex-grow-1 overflow-auto bg-light">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-top py-2.5 px-4 text-center text-muted small">
          Lead Management System © {new Date().getFullYear()} • Enterprise Sales CRM
        </footer>
      </div>
    </div>
  );
};
