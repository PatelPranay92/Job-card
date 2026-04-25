import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import Header from './components/Header';
import Login from './pages/Login';
import Home from './pages/Home';

import AddJobcard from './pages/jobcards/AddJobcard';
import JobcardList from './pages/jobcards/JobcardList';
import SearchJobcard from './pages/jobcards/SearchJobcard';
import ViewJobcard from './pages/jobcards/ViewJobcard';

import PrintReceipt from './pages/jobcards/PrintReceipt';
import PrintJobcard from './pages/jobcards/PrintJobcard';

import EditJobcard from './pages/jobcards/EditJobcard';
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

// Layout Component
const Layout = () => {
  return (
    <>
      <Header />
      <div className="container py-4">
        <Outlet />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            {/* Regular user routes */}
            <Route path="/jobcards" element={<JobcardList />} />
            <Route path="/jobcards/search" element={<SearchJobcard />} />
            <Route path="/jobcards/view/:id" element={<ViewJobcard />} />
            <Route path="/jobcards/edit/:id" element={<EditJobcard />} />
            <Route path="/jobcards/add" element={<AddJobcard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/models/add" element={<AddModel />} />
            </Route>
          </Route>

          {/* Print routes - outside Layout to avoid header */}
          <Route path="/jobcards/print-receipt/:id" element={<PrintReceipt />} />
          <Route path="/jobcards/print-jobcard/:id" element={<PrintJobcard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
