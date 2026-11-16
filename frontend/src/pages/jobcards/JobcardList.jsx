import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  FileEdit,
  CreditCard,
  FileText,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
  Car,
  Calendar,
} from 'lucide-react';
import api from '../../api/axios';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import PaymentModal from '../../components/PaymentModal';

const JobcardList = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [jobcards, setJobcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Payment Modal State
  const [showPayment, setShowPayment] = useState(false);
  const [selectedJobcard, setSelectedJobcard] = useState(null);

  const fetchJobcards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobcards');
      setJobcards(res.data || []);
    } catch (err) {
      console.error('Error fetching job cards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobcards();
  }, []);

  // Update searchTerm if query param changes
  useEffect(() => {
    if (initialQuery) {
      setSearchTerm(initialQuery);
    }
  }, [initialQuery]);

  const handleOpenPayment = (jc) => {
    setSelectedJobcard(jc);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (id, amount, method) => {
    try {
      await api.post(`/jobcards/${id}/pay`, { amount, method });
      fetchJobcards();
    } catch (err) {
      alert('Error recording payment: ' + (err.response?.data?.message || err.message));
    }
  };

  // Filter and Sort
  const filteredAndSorted = useMemo(() => {
    let list = jobcards.filter((jc) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        (jc.jobcard_no || '').toLowerCase().includes(q) ||
        (jc.customer_name || '').toLowerCase().includes(q) ||
        (jc.reg_no || '').toLowerCase().includes(q) ||
        (jc.model_name || '').toLowerCase().includes(q) ||
        (jc.phone || '').includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      return (jc.status || '').toUpperCase() === statusFilter;
    });

    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (sortField === 'amount' || sortField === 'remaining') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      } else {
        valA = (valA || '').toString().toLowerCase();
        valB = (valB || '').toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [jobcards, searchTerm, statusFilter, sortField, sortOrder]);

  // Total pages
  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedJobcards = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setSortField('date');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-saas">
        <div>
          <h1 className="page-title">Job Cards</h1>
          <p className="page-subtitle">
            Manage, inspect and track all service orders and vehicle repairs.
          </p>
        </div>
        <div className="page-actions w-100 w-sm-auto justify-content-between justify-content-sm-end">
          <Link to="/jobcards/search" className="btn-saas btn-saas-secondary">
            <Search size={15} />
            <span>Search</span>
          </Link>
          <Link to="/jobcards/add" className="btn-saas btn-saas-primary">
            <Plus size={16} />
            <span>New Job Card</span>
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="saas-card">
        {/* Filter & Search Bar */}
        <div className="saas-card-header flex-wrap gap-2">
          {/* Search Box */}
          <div className="position-relative w-100" style={{ maxWidth: '320px' }}>
            <Search
              size={15}
              className="position-absolute text-tertiary"
              style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control-saas"
              style={{ paddingLeft: '34px' }}
              placeholder="Search by ID, customer, reg no..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="d-flex align-items-center gap-2 flex-wrap ms-auto w-100 w-sm-auto justify-content-between justify-content-sm-end">
            <div className="d-flex bg-light p-1 rounded-2 border">
              {['ALL', 'UNPAID', 'PARTIAL', 'PAID'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`btn btn-sm py-1 px-2 px-sm-3 border-0 small ${
                    statusFilter === status
                      ? 'bg-white text-primary shadow-xs fw-semibold'
                      : 'text-secondary'
                  }`}
                  style={{
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11.5px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {status}
                </button>
              ))}
            </div>

            {(searchTerm || statusFilter !== 'ALL') && (
              <button
                onClick={handleResetFilters}
                className="btn-saas btn-saas-secondary btn-saas-sm"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Counter Bar */}
        <div
          className="px-3 px-sm-4 py-2 bg-light border-bottom d-flex justify-content-between align-items-center small text-secondary flex-wrap gap-1"
          style={{ fontSize: '12px' }}
        >
          <span>
            Showing <strong className="text-primary">{filteredAndSorted.length}</strong> of{' '}
            <strong>{jobcards.length}</strong> records
          </span>
          {searchTerm && (
            <span className="text-truncate" style={{ maxWidth: '200px' }}>
              Filtered: "<strong>{searchTerm}</strong>"
            </span>
          )}
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-4">
            <LoadingSkeleton type="table" rows={6} />
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <EmptyState
            icon={<FileText size={32} />}
            title="No job cards found"
            description={
              searchTerm || statusFilter !== 'ALL'
                ? 'No records match your active search and filter criteria.'
                : 'Get started by creating your first vehicle job card in the system.'
            }
            actionLabel={
              searchTerm || statusFilter !== 'ALL' ? 'Clear Filters' : 'New Job Card'
            }
            onAction={
              searchTerm || statusFilter !== 'ALL'
                ? handleResetFilters
                : () => (window.location.href = '/jobcards/add')
            }
          />
        ) : (
          <>
            {/* Desktop & Tablet Table (Hidden on mobile < 768px) */}
            <div className="d-none d-md-block saas-table-container border-0 rounded-0">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th
                      onClick={() => toggleSort('jobcard_no')}
                      style={{ cursor: 'pointer' }}
                      title="Sort by Job Card No"
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span>Job Card No</span>
                        <ArrowUpDown size={12} className="text-tertiary" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('date')}
                      style={{ cursor: 'pointer' }}
                      title="Sort by Date"
                    >
                      <div className="d-flex align-items-center gap-1">
                        <span>Date</span>
                        <ArrowUpDown size={12} className="text-tertiary" />
                      </div>
                    </th>
                    <th>Reg No</th>
                    <th>Customer</th>
                    <th>Model</th>
                    <th
                      className="text-end"
                      onClick={() => toggleSort('amount')}
                      style={{ cursor: 'pointer' }}
                      title="Sort by Amount"
                    >
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <span>Amount</span>
                        <ArrowUpDown size={12} className="text-tertiary" />
                      </div>
                    </th>
                    <th className="text-end">Paid</th>
                    <th
                      className="text-end"
                      onClick={() => toggleSort('remaining')}
                      style={{ cursor: 'pointer' }}
                      title="Sort by Remaining"
                    >
                      <div className="d-flex align-items-center justify-content-end gap-1">
                        <span>Remaining</span>
                        <ArrowUpDown size={12} className="text-tertiary" />
                      </div>
                    </th>
                    <th className="text-center">Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobcards.map((jc) => (
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
                              title="Record Payment"
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

            {/* Mobile Card List (Visible only on mobile < 768px) */}
            <div className="d-block d-md-none p-3">
              <div className="d-flex flex-column gap-3">
                {paginatedJobcards.map((jc) => (
                  <div
                    key={jc.jobcard_id || jc._id}
                    className="p-3 bg-white rounded-3 border shadow-xs"
                  >
                    {/* Header */}
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

                    {/* Customer & Vehicle */}
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

                    {/* Financial summary */}
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

                    {/* Actions with comfortable touch targets */}
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

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="small text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <div className="d-flex align-items-center gap-1">
              <button
                className="btn-saas btn-saas-secondary btn-saas-sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
                <span className="d-none d-sm-inline">Prev</span>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                let pageNum = idx + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + idx;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - idx);
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`btn btn-sm ${
                      currentPage === pageNum
                        ? 'btn-primary'
                        : 'btn-outline-secondary'
                    }`}
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="btn-saas btn-saas-secondary btn-saas-sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <span className="d-none d-sm-inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
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

export default JobcardList;
