import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  FileEdit,
  CreditCard,
  IndianRupee,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Car,
  Calendar,
} from 'lucide-react';
import api from '../api/axios';
import { getUser } from '../utils/auth';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import PaymentModal from '../components/PaymentModal';
import LoadingSkeleton from '../components/LoadingSkeleton';

const Home = () => {
  const navigate = useNavigate();
  const user = getUser();

  const [jobcards, setJobcards] = useState([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);
  const [selectedJobcard, setSelectedJobcard] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get today's date in Indian timezone
      const now = new Date();
      const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const today = istDate.toISOString().split('T')[0];

      const [jcRes, statsRes] = await Promise.all([
        api.get(`/jobcards?start_date=${today}`),
        api.get('/stats/daily'),
      ]);

      setJobcards(jcRes.data || []);
      setDailyTotal(statsRes.data?.total || 0);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenPayment = (jc) => {
    setSelectedJobcard(jc);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (id, amount, method) => {
    try {
      await api.post(`/jobcards/${id}/pay`, { amount, method });
      fetchData(); // Refresh list & daily stats
    } catch (err) {
      alert('Error recording payment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Metrics calculations
  const totalBilledToday = useMemo(() => {
    return jobcards.reduce((sum, jc) => sum + (jc.amount || 0), 0);
  }, [jobcards]);

  const unpaidCount = useMemo(() => {
    return jobcards.filter((jc) => jc.status === 'Unpaid').length;
  }, [jobcards]);

  const partialCount = useMemo(() => {
    return jobcards.filter((jc) => jc.status === 'Partial').length;
  }, [jobcards]);

  const paidCount = useMemo(() => {
    return jobcards.filter((jc) => jc.status === 'Paid').length;
  }, [jobcards]);

  // Filtered jobcards
  const filteredJobcards = useMemo(() => {
    return jobcards.filter((jc) => {
      const matchesSearch =
        (jc.jobcard_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jc.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jc.reg_no || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jc.model_name || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      return (jc.status || '').toUpperCase() === statusFilter;
    });
  }, [jobcards, searchQuery, statusFilter]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-saas">
        <div>
          <h1 className="page-title">Workshop Overview</h1>
          <p className="page-subtitle">
            Welcome back, <span className="fw-semibold text-primary">{user?.name || user?.username || 'Admin'}</span>. Today's workshop snapshot.
          </p>
        </div>
        <div className="page-actions">
          <button
            onClick={fetchData}
            className="btn-saas btn-saas-secondary"
            title="Refresh dashboard"
            aria-label="Refresh data"
          >
            <RefreshCw size={15} />
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
          <Link to="/jobcards/add" className="btn-saas btn-saas-primary">
            <Plus size={16} />
            <span>Create Job Card</span>
          </Link>
        </div>
      </div>

      {/* Summary Stat Cards Grid */}
      <div className="row g-2 g-sm-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Today's Collections"
            value={`₹${dailyTotal.toFixed(2)}`}
            subtitle="Cash, UPI & Card payments"
            icon={<IndianRupee size={22} />}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Today's Job Cards"
            value={jobcards.length}
            subtitle={`Total billed: ₹${totalBilledToday.toFixed(2)}`}
            icon={<FileText size={22} />}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Unpaid / Pending"
            value={unpaidCount + partialCount}
            subtitle={`${unpaidCount} unpaid, ${partialCount} partial`}
            icon={<AlertCircle size={22} />}
            color="warning"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            label="Completed & Paid"
            value={paidCount}
            subtitle={
              jobcards.length > 0
                ? `${Math.round((paidCount / jobcards.length) * 100)}% settled`
                : 'No cards yet'
            }
            icon={<CheckCircle2 size={22} />}
            color="info"
          />
        </div>
      </div>

      {/* Workflow Progress Bar */}
      {jobcards.length > 0 && (
        <div className="saas-card mb-4 p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small fw-semibold text-secondary">Today's Settlement Status</span>
            <span className="small text-secondary fw-medium">
              {paidCount} of {jobcards.length} cleared
            </span>
          </div>
          <div
            className="d-flex rounded-pill overflow-hidden"
            style={{ height: '8px', backgroundColor: 'var(--bg-subtle)' }}
          >
            <div
              style={{
                width: `${(paidCount / jobcards.length) * 100}%`,
                backgroundColor: 'var(--success)',
                transition: 'width 0.4s ease',
              }}
              title={`Paid: ${paidCount}`}
            />
            <div
              style={{
                width: `${(partialCount / jobcards.length) * 100}%`,
                backgroundColor: 'var(--warning)',
                transition: 'width 0.4s ease',
              }}
              title={`Partial: ${partialCount}`}
            />
            <div
              style={{
                width: `${(unpaidCount / jobcards.length) * 100}%`,
                backgroundColor: 'var(--danger)',
                transition: 'width 0.4s ease',
              }}
              title={`Unpaid: ${unpaidCount}`}
            />
          </div>
          <div className="d-flex gap-3 gap-sm-4 mt-2 small text-secondary flex-wrap">
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                }}
              />
              Paid ({paidCount})
            </span>
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--warning)',
                }}
              />
              Partial ({partialCount})
            </span>
            <span className="d-flex align-items-center gap-1">
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--danger)',
                }}
              />
              Unpaid ({unpaidCount})
            </span>
          </div>
        </div>
      )}

      {/* Today's Job Cards Section */}
      <div className="saas-card">
        <div className="saas-card-header flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <h2 className="saas-card-title mb-0">
              <FileText size={18} className="text-primary" />
              <span>Today's Job Cards</span>
            </h2>
            <span className="badge bg-light text-secondary border">
              {jobcards.length}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-sm-auto justify-content-between justify-content-sm-end">
            {/* Quick status filter pills */}
            <div className="d-flex bg-light p-1 rounded-2 border">
              {['ALL', 'UNPAID', 'PARTIAL', 'PAID'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`btn btn-sm py-1 px-2 border-0 small ${
                    statusFilter === status
                      ? 'bg-white text-primary shadow-xs fw-semibold'
                      : 'text-secondary'
                  }`}
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* In-table search */}
            <div className="position-relative" style={{ width: '100%', maxWidth: '200px' }}>
              <Search
                size={14}
                className="position-absolute text-tertiary"
                style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-control-saas py-1"
                style={{ paddingLeft: '30px', fontSize: '12px', height: '32px' }}
                placeholder="Filter today..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-4">
            <LoadingSkeleton type="table" rows={4} />
          </div>
        ) : filteredJobcards.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title={
              jobcards.length === 0
                ? 'No job cards created today'
                : 'No matching job cards'
            }
            description={
              jobcards.length === 0
                ? 'Create a new job card to begin logging repairs, parts, and customer details.'
                : 'Try adjusting your search query or filter.'
            }
            actionLabel={jobcards.length === 0 ? 'Create First Job Card' : undefined}
            onAction={jobcards.length === 0 ? () => navigate('/jobcards/add') : undefined}
          />
        ) : (
          <>
            {/* Desktop & Tablet Table View (hidden on mobile < 768px) */}
            <div className="d-none d-md-block saas-table-container border-0 rounded-0">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Job Card No</th>
                    <th>Date</th>
                    <th>Reg No</th>
                    <th>Customer</th>
                    <th>Model</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Paid</th>
                    <th className="text-end">Remaining</th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobcards.map((jc) => (
                    <tr key={jc.jobcard_id || jc._id}>
                      <td>
                        <Link
                          to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                          className="fw-semibold text-primary"
                        >
                          {jc.jobcard_no}
                        </Link>
                      </td>
                      <td className="text-secondary small">
                        {new Date(jc.date).toLocaleDateString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-medium">
                          {jc.reg_no}
                        </span>
                      </td>
                      <td className="fw-medium">{jc.customer_name}</td>
                      <td className="text-secondary small">{jc.model_name || '—'}</td>
                      <td className="text-end fw-semibold">₹{(jc.amount || 0).toFixed(2)}</td>
                      <td className="text-end text-success fw-medium">
                        ₹{(jc.paid || 0).toFixed(2)}
                      </td>
                      <td
                        className={`text-end fw-bold ${
                          (jc.remaining || 0) > 0 ? 'text-danger' : 'text-secondary'
                        }`}
                      >
                        ₹{(jc.remaining || 0).toFixed(2)}
                      </td>
                      <td className="text-center">
                        <StatusBadge status={jc.status} />
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex align-items-center gap-1">
                          <Link
                            to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                            className="btn-saas btn-saas-secondary btn-saas-icon"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/jobcards/edit/${jc.jobcard_id || jc._id}`}
                            className="btn-saas btn-saas-secondary btn-saas-icon"
                            title="Edit Job Card"
                          >
                            <FileEdit size={15} />
                          </Link>
                          {(jc.remaining || 0) > 0 && (
                            <button
                              onClick={() => handleOpenPayment(jc)}
                              className="btn-saas btn-saas-primary btn-saas-sm"
                              title="Collect Payment"
                            >
                              <CreditCard size={14} />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (shown only on mobile < 768px) */}
            <div className="d-block d-md-none p-3">
              <div className="d-flex flex-column gap-3">
                {filteredJobcards.map((jc) => (
                  <div
                    key={jc.jobcard_id || jc._id}
                    className="p-3 bg-white rounded-3 border shadow-xs"
                  >
                    {/* Card Header: Job Card No + Status */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <Link
                          to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                          className="fw-bold text-primary fs-6 d-block"
                        >
                          {jc.jobcard_no}
                        </Link>
                        <span className="small text-secondary d-flex align-items-center gap-1">
                          <Calendar size={12} />
                          {new Date(jc.date).toLocaleDateString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <StatusBadge status={jc.status} size="sm" />
                    </div>

                    {/* Customer & Vehicle Info */}
                    <div className="d-flex flex-column gap-1 mb-3 pt-2 border-top">
                      <div className="d-flex align-items-center gap-2 small">
                        <User size={13} className="text-secondary" />
                        <span className="fw-semibold">{jc.customer_name}</span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between small">
                        <div className="d-flex align-items-center gap-2">
                          <Car size={13} className="text-secondary" />
                          <span className="text-secondary">{jc.model_name || 'Vehicle'}</span>
                        </div>
                        <span className="badge bg-light text-dark border">
                          {jc.reg_no}
                        </span>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="d-flex justify-content-between align-items-baseline p-2 bg-light rounded-2 mb-3 small">
                      <div>
                        <span className="text-secondary d-block" style={{ fontSize: '11px' }}>Total</span>
                        <span className="fw-bold">₹{(jc.amount || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-secondary d-block" style={{ fontSize: '11px' }}>Paid</span>
                        <span className="fw-medium text-success">₹{(jc.paid || 0).toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-secondary d-block" style={{ fontSize: '11px' }}>Due</span>
                        <span className={`fw-bold ${(jc.remaining || 0) > 0 ? 'text-danger' : 'text-secondary'}`}>
                          ₹{(jc.remaining || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons with accessible touch targets */}
                    <div className="d-flex gap-2">
                      <Link
                        to={`/jobcards/view/${jc.jobcard_id || jc._id}`}
                        className="btn-saas btn-saas-secondary flex-grow-1"
                        style={{ minHeight: '40px' }}
                      >
                        <Eye size={15} />
                        <span>View</span>
                      </Link>
                      <Link
                        to={`/jobcards/edit/${jc.jobcard_id || jc._id}`}
                        className="btn-saas btn-saas-secondary btn-saas-icon flex-shrink-0"
                        style={{ minHeight: '40px', width: '40px' }}
                        title="Edit"
                      >
                        <FileEdit size={16} />
                      </Link>
                      {(jc.remaining || 0) > 0 && (
                        <button
                          onClick={() => handleOpenPayment(jc)}
                          className="btn-saas btn-saas-primary flex-grow-1"
                          style={{ minHeight: '40px' }}
                        >
                          <CreditCard size={15} />
                          <span>Pay</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Processing Modal */}
      {selectedJobcard && (
        <PaymentModal
          show={showPayment}
          handleClose={() => setShowPayment(false)}
          jobcard={selectedJobcard}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default Home;
