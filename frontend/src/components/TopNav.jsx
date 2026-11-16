import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
  X,
  PanelLeftOpen,
} from "lucide-react";
import { Dropdown } from "react-bootstrap";
import { useSidebar } from "./SidebarContext";
import { getUser, isAdmin } from "../utils/auth";

const TopNav = () => {
  const { collapsed, toggleCollapsed, toggleMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const admin = isAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleGlobalSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/jobcards?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Generate breadcrumb items from current path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === "/") return [{ label: "Dashboard", path: "/" }];

    const segments = path.split("/").filter(Boolean);
    const crumbs = [{ label: "Home", path: "/" }];

    if (segments[0] === "jobcards") {
      crumbs.push({ label: "Job Cards", path: "/jobcards" });
      if (segments[1] === "add") {
        crumbs.push({ label: "New Job Card", path: "/jobcards/add" });
      } else if (segments[1] === "search") {
        crumbs.push({ label: "Search", path: "/jobcards/search" });
      } else if (segments[1] === "view") {
        crumbs.push({ label: "Details", path: location.pathname });
      } else if (segments[1] === "edit") {
        crumbs.push({ label: "Edit", path: location.pathname });
      }
    } else if (segments[0] === "models") {
      crumbs.push({ label: "Vehicle Models", path: "/models/add" });
    } else if (segments[0] === "profile") {
      crumbs.push({ label: "Settings", path: "/profile" });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const currentPageTitle =
    breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard";

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="top-nav">
      {/* Normal Header View */}
      {!mobileSearchOpen ? (
        <>
          {/* Left side: Hamburger Button (mobile) / Expand Button (desktop collapsed) & Breadcrumb */}
          <div className="top-nav-left">
            {/* Mobile Menu Button */}
            <button
              className="mobile-menu-btn"
              onClick={toggleMobile}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>

            {/* Desktop Expand Button when collapsed */}
            {collapsed && (
              <button
                className="btn-saas-icon d-none d-lg-flex align-items-center justify-content-center text-secondary border-0"
                onClick={toggleCollapsed}
                title="Expand sidebar"
                aria-label="Expand sidebar"
                style={{
                  background: "var(--bg-subtle)",
                  borderRadius: "var(--radius-sm)",
                  width: "32px",
                  height: "32px",
                }}
              >
                <PanelLeftOpen size={18} />
              </button>
            )}

            {/* Desktop / Tablet Breadcrumbs */}
            <nav
              className="breadcrumb-nav d-none d-md-flex ms-1"
              aria-label="Breadcrumb"
            >
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.path + idx}>
                  {idx > 0 && <ChevronRight size={14} className="separator" />}
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="current-page">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path}>{crumb.label}</Link>
                  )}
                </React.Fragment>
              ))}
            </nav>

            {/* Mobile Title */}
            <span
              className="d-flex d-md-none fw-bold text-dark fs-6 text-truncate"
              style={{ maxWidth: "160px" }}
            >
              {currentPageTitle}
            </span>
          </div>

          {/* Right side: Search,Profile */}
          <div className="top-nav-right">
            {/* Desktop Search */}
            <div className="global-search-container d-none d-md-block">
              <Search size={15} className="global-search-icon" />
              <input
                type="text"
                className="global-search-input"
                placeholder="Search job cards, vehicles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleGlobalSearch}
                aria-label="Global search"
              />
            </div>

            {/* Mobile Search Toggle Button */}
            <button
              className="nav-icon-btn d-flex d-md-none"
              onClick={() => setMobileSearchOpen(true)}
              title="Search"
              aria-label="Open search input"
            >
              <Search size={18} />
            </button>

            {/* User Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                style={{ cursor: "pointer" }}
                className="d-flex align-items-center gap-2 p-1"
                aria-label="User profile options"
              >
                <div
                  className="user-avatar-circle"
                  style={{ width: "36px", height: "36px" }}
                >
                  {getInitials(user?.name || user?.username)}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu
                className="shadow-sm border mt-2 py-2"
                style={{
                  minWidth: "220px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="px-3 py-2 border-bottom mb-1">
                  <div className="fw-semibold text-truncate">
                    {user?.name || user?.username || "User"}
                  </div>
                  <div className="text-secondary small d-flex align-items-center gap-1">
                    {admin && (
                      <ShieldCheck size={13} className="text-primary" />
                    )}
                    {user?.role || "Staff Member"}
                  </div>
                </div>

                <Dropdown.Item
                  as={Link}
                  to="/profile"
                  className="d-flex align-items-center gap-2 py-2"
                >
                  <User size={16} className="text-secondary" />
                  <span>Profile & Password</span>
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                  className="d-flex align-items-center gap-2 py-2 text-danger"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </>
      ) : (
        /* Mobile Search Expanded Bar */
        <div className="d-flex align-items-center w-100 gap-2">
          <div className="position-relative flex-grow-1">
            <Search
              size={16}
              className="position-absolute text-tertiary"
              style={{
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
            <input
              type="text"
              autoFocus
              className="form-control-saas py-2"
              style={{ paddingLeft: "36px", height: "40px" }}
              placeholder="Search job cards, vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleGlobalSearch}
            />
          </div>
          <button
            className="btn-saas btn-saas-secondary btn-saas-icon flex-shrink-0"
            onClick={() => setMobileSearchOpen(false)}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
};

export default TopNav;
