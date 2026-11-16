import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { SidebarProvider, useSidebar } from './components/SidebarContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';

import Login from './pages/Login';
import Home from './pages/Home';

import AddJobcard from './pages/jobcards/AddJobcard';
import JobcardList from './pages/jobcards/JobcardList';
import SearchJobcard from './pages/jobcards/SearchJobcard';
import ViewJobcard from './pages/jobcards/ViewJobcard';
import EditJobcard from './pages/jobcards/EditJobcard';

import PrintReceipt from './pages/jobcards/PrintReceipt';
import PrintJobcard from './pages/jobcards/PrintJobcard';

import AddModel from './pages/models/AddModel';
import Profile from './pages/Profile';
import { isAdmin } from './utils/auth';

// Protected Route Component
const ProtectedRoute = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Admin-Only Route Component
const AdminRoute = () => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// Internal Layout Structure with Sidebar Context
const DashboardShell = () => {
  const { collapsed } = useSidebar();
  return (
    <div className="app-shell">
      <Sidebar />
      <div className={`main-viewport ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <TopNav />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Layout with Provider
const Layout = () => {
  return (
    <SidebarProvider>
      <DashboardShell />
    </SidebarProvider>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Main Layout routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/jobcards" element={<JobcardList />} />
            <Route path="/jobcards/search" element={<SearchJobcard />} />
            <Route path="/jobcards/view/:id" element={<ViewJobcard />} />
            <Route path="/jobcards/edit/:id" element={<EditJobcard />} />
            <Route path="/jobcards/add" element={<AddJobcard />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin-only routes within Layout */}
            <Route element={<AdminRoute />}>
              <Route path="/models/add" element={<AddModel />} />
            </Route>
          </Route>

          {/* Standalone Print Routes (outside main dashboard layout) */}
          <Route path="/jobcards/print-receipt/:id" element={<PrintReceipt />} />
          <Route path="/jobcards/print-jobcard/:id" element={<PrintJobcard />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
