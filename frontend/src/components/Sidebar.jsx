import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Search,
  Car,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
  ShieldCheck,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useSidebar } from './SidebarContext';
import { getUser, isAdmin } from '../utils/auth';

const Sidebar = () => {
  const { collapsed, toggleCollapsed, mobileOpen, closeMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const admin = isAdmin();

  const handleLogout = () => {
    localStorage.removeItem('user');
    closeMobile();
    navigate('/login');
  };

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const navItemClick = () => {
    if (window.innerWidth < 1024) {
      closeMobile();
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'active' : ''}`}
        onClick={closeMobile}
        aria-hidden="true"
      />

      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
        aria-label="Main Navigation"
      >
        {/* Header / Brand */}
        <div className="sidebar-header">
          {!collapsed || mobileOpen ? (
            /* Expanded Brand Header */
            <div className="d-flex align-items-center justify-content-between w-100">
              <NavLink
                to="/"
                className="sidebar-brand text-decoration-none"
                onClick={navItemClick}
              >
                <div className="brand-icon-box">
                  <Wrench size={19} />
                </div>
                <div className="d-flex flex-column" style={{ lineHeight: '1.2' }}>
                  <div className="d-flex align-items-center gap-1">
                    <span className="brand-title">JOBCARD</span>
                  </div>
                  <span className="brand-subtitle">Gayatri Auto Workshop</span>
                </div>
              </NavLink>

              {/* Desktop Collapse Button */}
              <button
                className="sidebar-toggle-btn d-none d-lg-flex"
                onClick={toggleCollapsed}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={17} />
              </button>

              {/* Mobile Close Button */}
              <button
                className="sidebar-toggle-btn d-flex d-lg-none"
                onClick={closeMobile}
                title="Close menu"
                aria-label="Close navigation menu"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            /* Collapsed Brand Header: Cleanly centered icon ONLY */
            <div className="d-flex align-items-center justify-content-center w-100">
              <NavLink
                to="/"
                className="brand-icon-box text-decoration-none"
                title="JOBCARD PRO — Home"
                onClick={navItemClick}
              >
                <Wrench size={19} />
              </NavLink>
            </div>
          )}
        </div>

        {/* Navigation Content */}
        <div className="sidebar-content">
          {/* Section: Overview */}
          <div className="sidebar-group">
            {!collapsed && <div className="sidebar-section-title">Overview</div>}
            <ul className="sidebar-nav-list">
              <li className="sidebar-nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive: isLinkActive }) =>
                    `sidebar-nav-link ${isLinkActive ? 'active' : ''}`
                  }
                  onClick={navItemClick}
                  title="Dashboard Overview"
                >
                  <span className="nav-icon-container">
                    <LayoutDashboard size={18} />
                  </span>
                  {!collapsed && <span className="nav-label">Dashboard</span>}
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Section: Workshop Management */}
          <div className="sidebar-group">
            {!collapsed && <div className="sidebar-section-title">Workshop</div>}
            <ul className="sidebar-nav-list">
              <li className="sidebar-nav-item">
                <NavLink
                  to="/jobcards"
                  end
                  className={`sidebar-nav-link ${
                    isActive('/jobcards', true) ? 'active' : ''
                  }`}
                  onClick={navItemClick}
                  title="All Job Cards"
                >
                  <span className="nav-icon-container">
                    <FileText size={18} />
                  </span>
                  {!collapsed && <span className="nav-label">All Job Cards</span>}
                </NavLink>
              </li>

              <li className="sidebar-nav-item">
                <NavLink
                  to="/jobcards/add"
                  className={({ isActive: isLinkActive }) =>
                    `sidebar-nav-link ${isLinkActive ? 'active' : ''}`
                  }
                  onClick={navItemClick}
                  title="Create New Job Card"
                >
                  <span className="nav-icon-container">
                    <PlusCircle size={18} />
                  </span>
                  {!collapsed && <span className="nav-label">New Job Card</span>}
                  {!collapsed && <span className="nav-shortcut-badge">Add</span>}
                </NavLink>
              </li>

              <li className="sidebar-nav-item">
                <NavLink
                  to="/jobcards/search"
                  className={({ isActive: isLinkActive }) =>
                    `sidebar-nav-link ${isLinkActive ? 'active' : ''}`
                  }
                  onClick={navItemClick}
                  title="Advanced Search"
                >
                  <span className="nav-icon-container">
                    <Search size={18} />
                  </span>
                  {!collapsed && <span className="nav-label">Search Records</span>}
                </NavLink>
              </li>

              {admin && (
                <li className="sidebar-nav-item">
                  <NavLink
                    to="/models/add"
                    className={({ isActive: isLinkActive }) =>
                      `sidebar-nav-link ${isLinkActive ? 'active' : ''}`
                    }
                    onClick={navItemClick}
                    title="Vehicle Models"
                  >
                    <span className="nav-icon-container">
                      <Car size={18} />
                    </span>
                    {!collapsed && <span className="nav-label">Vehicle Models</span>}
                  </NavLink>
                </li>
              )}
            </ul>
          </div>

          {/* Section: System & Account */}
          <div className="sidebar-group">
            {!collapsed && <div className="sidebar-section-title">System</div>}
            <ul className="sidebar-nav-list">
              <li className="sidebar-nav-item">
                <NavLink
                  to="/profile"
                  className={({ isActive: isLinkActive }) =>
                    `sidebar-nav-link ${isLinkActive ? 'active' : ''}`
                  }
                  onClick={navItemClick}
                  title="Profile & Security"
                >
                  <span className="nav-icon-container">
                    <User size={18} />
                  </span>
                  {!collapsed && <span className="nav-label">Account & Security</span>}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer / User Profile & Desktop Expand/Collapse Control */}
        <div className="sidebar-footer">
          {!collapsed || mobileOpen ? (
            /* Expanded Footer: User Profile + Collapse Button */
            <div className="d-flex flex-column gap-2">
              <div
                className="sidebar-user-card"
                onClick={() => {
                  navigate('/profile');
                  navItemClick();
                }}
                title="View Profile"
              >
                <div className="user-avatar-circle">
                  {getInitials(user?.name || user?.username)}
                </div>
                <div className="user-meta flex-grow-1">
                  <div className="user-meta-name">
                    {user?.name || user?.username || 'Admin User'}
                  </div>
                  <div className="user-meta-role d-flex align-items-center gap-1">
                    {admin && <ShieldCheck size={12} className="text-primary" />}
                    <span>{user?.role || 'Staff'}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  className="btn-user-action"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Desktop quick collapse bar */}
              <button
                onClick={toggleCollapsed}
                className="sidebar-collapse-text-btn d-none d-lg-flex"
                title="Collapse sidebar to icon mode"
              >
                <ChevronLeft size={15} />
                <span>Collapse Sidebar</span>
              </button>
            </div>
          ) : (
            /* Collapsed Footer: Clean avatar + Expand Button */
            <div className="d-flex flex-column align-items-center gap-2">
              <div
                className="user-avatar-circle"
                onClick={() => navigate('/profile')}
                title={`Signed in as ${user?.name || user?.username || 'User'}`}
                style={{ cursor: 'pointer' }}
              >
                {getInitials(user?.name || user?.username)}
              </div>

              <button
                onClick={toggleCollapsed}
                className="sidebar-expand-icon-btn d-none d-lg-flex"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
