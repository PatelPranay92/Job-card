import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  Trash2,
  FileEdit,
  CreditCard,
  User,
  Car,
  Calendar,
  Package,
  Wrench,
} from 'lucide-react';
import api from '../../api/axios';
import { isAdmin } from '../../utils/auth';
import StatusBadge from '../../components/StatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import PaymentModal from '../../components/PaymentModal';

const ViewJobcard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [jobcard, setJobcard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Payment modal state
  const [showPayment, setShowPayment] = useState(false);

  const fetchJobcard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/jobcards/${id}`);
      setJobcard(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching job card details');
      navigate('/jobcards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobcard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/jobcards/${id}`);
      setShowDeleteConfirm(false);
      navigate('/jobcards');
    } catch (err) {
      console.error(err);
      alert('Error deleting job card: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(false);
    }
  };

  const handlePaymentSuccess = async (jobcardId, amount, method) => {
    try {
      await api.post(`/jobcards/${jobcardId}/pay`, { amount, method });
      fetchJobcard(); // Refresh
    } catch (err) {
      console.error(err);
      alert('Error recording payment');
    }
  };

  if (loading || !jobcard) {
    return (
      <div>
        <div className="page-header-saas">
          <div>
            <h1 className="page-title">Job Card Details</h1>
          </div>
        </div>
        <LoadingSkeleton type="form" />
      </div>
    );
  }

  const calculateTotal = (items) =>
    items ? items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0) : 0;

  const partsTotal = calculateTotal(jobcard.parts);
  const labourTotal = calculateTotal(jobcard.labour);
  const servicesTotal = calculateTotal(jobcard.services);
  const grandTotal = jobcard.amount || partsTotal + labourTotal + servicesTotal;
  const remaining = jobcard.remaining ?? grandTotal - (jobcard.paid || 0);

  return (
    <div>
      {/* Header & Action Toolbar */}
      <div className="page-header-saas">
        <div>
          <Link
            to="/jobcards"
            className="text-decoration-none text-secondary small d-inline-flex align-items-center gap-1 mb-1"
          >
            <ArrowLeft size={14} /> Back to Job Cards
          </Link>
          <div className="d-flex align-items-center gap-2 gap-sm-3 flex-wrap">
            <h1 className="page-title">{jobcard.jobcard_no}</h1>
            <StatusBadge status={jobcard.status} />
            <span className="text-secondary small d-flex align-items-center gap-1">
              <Calendar size={14} />
              {new Date(jobcard.date).toLocaleDateString('en-IN', {
                timeZone: 'Asia/Kolkata',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        {/* Action Buttons Toolbar with Responsive Wrapping */}
        <div className="page-actions w-100 w-sm-auto justify-content-start justify-content-sm-end">
          {remaining > 0 && (
            <button
              onClick={() => setShowPayment(true)}
              className="btn-saas btn-saas-primary flex-grow-1 flex-sm-grow-0"
              style={{ minHeight: '40px' }}
            >
              <CreditCard size={15} />
              <span>Record Payment</span>
            </button>
          )}

          <Link
            to={`/jobcards/edit/${id}`}
            className="btn-saas btn-saas-secondary"
            style={{ minHeight: '40px' }}
            title="Edit details"
          >
            <FileEdit size={15} />
            <span className="d-none d-sm-inline">Edit</span>
          </Link>

          <Link
            to={`/jobcards/print-jobcard/${id}`}
            target="_blank"
            className="btn-saas btn-saas-secondary"
            style={{ minHeight: '40px' }}
            title="Open printable mechanic sheet"
          >
            <Printer size={15} />
            <span className="d-none d-sm-inline">Mechanic Copy</span>
          </Link>

          <Link
            to={`/jobcards/print-receipt/${id}`}
            target="_blank"
            className="btn-saas btn-saas-secondary"
            style={{ minHeight: '40px' }}
            title="Open printable customer invoice"
          >
            <Printer size={15} />
            <span className="d-none d-sm-inline">Customer Receipt</span>
          </Link>

          {isAdmin() && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-saas btn-saas-outline-danger"
              style={{ minHeight: '40px' }}
              title="Delete this job card"
              aria-label="Delete job card"
            >
              <Trash2 size={15} />
              <span className="d-none d-sm-inline">Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Overview Banner (2x2 on mobile, 4-col on desktop) */}
      <div className="saas-card mb-4 p-3 p-sm-4">
        <div className="row g-3 text-center text-sm-start">
          <div className="col-6 col-sm-3 border-end-sm">
            <div className="small text-secondary mb-1">Total Billed</div>
            <div className="fs-5 fs-sm-4 fw-bold text-primary">₹{grandTotal.toFixed(2)}</div>
          </div>
          <div className="col-6 col-sm-3 border-end-sm">
            <div className="small text-secondary mb-1">Amount Paid</div>
            <div className="fs-5 fs-sm-4 fw-bold text-success">
              ₹{(jobcard.paid || 0).toFixed(2)}
            </div>
          </div>
          <div className="col-6 col-sm-3 border-end-sm">
            <div className="small text-secondary mb-1">Balance Due</div>
            <div
              className={`fs-5 fs-sm-4 fw-bold ${remaining > 0 ? 'text-danger' : 'text-secondary'}`}
            >
              ₹{remaining.toFixed(2)}
            </div>
          </div>
          <div className="col-6 col-sm-3">
            <div className="small text-secondary mb-1">Status</div>
            <div className="mt-1">
              <StatusBadge status={jobcard.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Details Row: Customer & Vehicle */}
      <div className="row g-3 g-sm-4 mb-4">
        {/* Customer Information Card */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <div className="saas-card-title">
                <User size={18} className="text-primary" />
                <span>Customer Information</span>
              </div>
            </div>
            <div className="saas-card-body">
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between py-2 border-bottom flex-wrap gap-1">
                  <span className="text-secondary small">Customer Name</span>
                  <span className="fw-semibold">{jobcard.customer_name || '—'}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom flex-wrap gap-1">
                  <span className="text-secondary small">Phone Number</span>
                  <span className="fw-medium">
                    {jobcard.phone ? (
                      <a href={`tel:${jobcard.phone}`} className="text-primary text-decoration-none">
                        {jobcard.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom flex-wrap gap-1">
                  <span className="text-secondary small">Address</span>
                  <span className="text-sm-end fw-medium">{jobcard.address || '—'}</span>
                </div>
                <div className="d-flex justify-content-between py-2 flex-wrap gap-1">
                  <span className="text-secondary small">City / Village</span>
                  <span className="fw-medium">{jobcard.city || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information Card */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header flex-wrap gap-2">
              <div className="saas-card-title">
                <Car size={18} className="text-info" />
                <span>Vehicle Specifications</span>
              </div>
              <span className="badge bg-light text-dark border fw-bold px-2 py-1">
                {jobcard.reg_no}
              </span>
            </div>
            <div className="saas-card-body">
              <div className="row g-3">
                <div className="col-6 col-sm-6">
                  <div className="small text-secondary">Model</div>
                  <div className="fw-semibold">{jobcard.model_name || '—'}</div>
                </div>
                <div className="col-6 col-sm-6">
                  <div className="small text-secondary">Odometer (KM)</div>
                  <div className="fw-semibold">{jobcard.km ? `${jobcard.km} KM` : '—'}</div>
                </div>
                <div className="col-6 col-sm-6">
                  <div className="small text-secondary">Fuel Level</div>
                  <div className="fw-semibold">{jobcard.petrol || '—'}</div>
                </div>
                <div className="col-6 col-sm-6">
                  <div className="small text-secondary">Vehicle Type</div>
                  <div className="fw-semibold">{jobcard.vehicle_type || 'Bike'}</div>
                </div>
                <div className="col-6 col-sm-6">
                  <div className="small text-secondary">Mechanic</div>
                  <div className="fw-medium">{jobcard.mechanic_name || '—'}</div>
                </div>
                <div className="col-6 col-sm-6">
                  <div className="small text-secondary">Helper</div>
                  <div className="fw-medium">{jobcard.helper_name || '—'}</div>
                </div>
                {jobcard.remarks && (
                  <div className="col-12 pt-2 border-top">
                    <div className="small text-secondary">Reported Problem / Remarks</div>
                    <div className="fst-italic text-dark mt-1 small bg-light p-2 rounded">
                      "{jobcard.remarks}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items: Parts & Labour */}
      <div className="row g-3 g-sm-4 mb-4">
        {/* Parts Table */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <div className="saas-card-title text-success">
                <Package size={18} />
                <span>Replacement Parts ({jobcard.parts?.length || 0})</span>
              </div>
              <span className="fw-bold text-success">₹{partsTotal.toFixed(2)}</span>
            </div>

            <div className="saas-table-container border-0 rounded-0">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Part Name</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {jobcard.parts && jobcard.parts.length > 0 ? (
                    jobcard.parts.map((p, i) => (
                      <tr key={i}>
                        <td className="text-secondary small" style={{ width: '40px' }}>
                          {i + 1}
                        </td>
                        <td className="fw-medium">{p.name}</td>
                        <td className="text-end fw-semibold">₹{(p.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-3 text-secondary small">
                        No replacement parts recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Labour Table */}
        <div className="col-12 col-lg-6">
          <div className="saas-card h-100">
            <div className="saas-card-header">
              <div className="saas-card-title text-primary">
                <Wrench size={18} />
                <span>Labour & Charges ({jobcard.labour?.length || 0})</span>
              </div>
              <span className="fw-bold text-primary">₹{labourTotal.toFixed(2)}</span>
            </div>

            <div className="saas-table-container border-0 rounded-0">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Labour Service</th>
                    <th className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {jobcard.labour && jobcard.labour.length > 0 ? (
                    jobcard.labour.map((l, i) => (
                      <tr key={i}>
                        <td className="text-secondary small" style={{ width: '40px' }}>
                          {i + 1}
                        </td>
                        <td className="fw-medium">{l.name}</td>
                        <td className="text-end fw-semibold">₹{(l.amount || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center py-3 text-secondary small">
                        No labour charges recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={showDeleteConfirm}
        title="Delete Job Card"
        message={`Are you sure you want to permanently delete Job Card ${jobcard.jobcard_no}? This operation cannot be undone.`}
        confirmText={deleting ? 'Deleting...' : 'Delete Permanently'}
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Payment Modal */}
      <PaymentModal
        show={showPayment}
        handleClose={() => setShowPayment(false)}
        jobcard={{
          ...jobcard,
          jobcard_id: id,
          amount: grandTotal,
          remaining: remaining,
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default ViewJobcard;
