import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { CreditCard, CheckCircle2, User, FileText } from 'lucide-react';

const PaymentModal = ({ show, handleClose, jobcard, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [error, setError] = useState('');

  if (!jobcard) return null;

  const remaining = jobcard.remaining || 0;

  const handleMaxAmount = () => {
    setAmount(remaining.toString());
  };

  const handleModalClose = () => {
    setAmount('');
    setMethod('Cash');
    setError('');
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) {
      setError('Please enter a valid payment amount greater than zero');
      return;
    }
    if (payAmount > remaining) {
      setError(`Amount cannot exceed the remaining balance of ₹${remaining.toFixed(2)}`);
      return;
    }
    if (!method) {
      setError('Please select a payment method');
      return;
    }

    onPaymentSuccess(jobcard.jobcard_id, payAmount, method);
    handleModalClose();
  };

  const paymentMethods = [
    { id: 'Cash', label: 'Cash' },
    { id: 'UPI', label: 'UPI / QR' },
    { id: 'Card', label: 'Credit / Debit Card' },
    { id: 'Net Banking', label: 'Net Banking' },
  ];

  return (
    <Modal show={show} onHide={handleModalClose} centered size="md">
      <Modal.Header closeButton className="border-bottom px-4 pt-3 pb-3">
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
            }}
          >
            <CreditCard size={18} />
          </div>
          <span>Record Payment</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Jobcard Summary Card */}
        <div
          className="p-3 mb-4 rounded-3 border"
          style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)' }}
        >
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-secondary d-flex align-items-center gap-1">
              <FileText size={14} /> {jobcard.jobcard_no}
            </span>
            <span className="small text-secondary d-flex align-items-center gap-1">
              <User size={14} /> {jobcard.customer_name}
            </span>
          </div>

          <div className="d-flex justify-content-between align-items-baseline pt-2 border-top">
            <div>
              <span className="small text-secondary">Total Billed:</span>{' '}
              <span className="fw-semibold">₹{(jobcard.amount || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="small text-secondary">Paid:</span>{' '}
              <span className="fw-semibold text-success">₹{(jobcard.paid || 0).toFixed(2)}</span>
            </div>
            <div>
              <span className="small text-secondary">Remaining:</span>{' '}
              <span className="fw-bold text-danger fs-6">₹{remaining.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="py-2 px-3 small mb-3">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label-saas mb-0">
                Payment Amount (₹)<span className="required-star">*</span>
              </label>
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-decoration-none small text-primary fw-medium"
                onClick={handleMaxAmount}
              >
                Pay Full (₹{remaining.toFixed(2)})
              </button>
            </div>
            <div className="position-relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={remaining}
                className="form-control-saas"
                style={{ paddingLeft: '32px' }}
                placeholder={`Max ₹${remaining.toFixed(2)}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
              <span
                className="position-absolute text-secondary"
                style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: '500' }}
              >
                ₹
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mb-4">
            <label className="form-label-saas mb-2">
              Payment Method<span className="required-star">*</span>
            </label>
            <div className="d-grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              {paymentMethods.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-2 rounded-2 border text-center cursor-pointer transition-all ${
                    method === m.id
                      ? 'border-primary bg-primary-subtle text-primary fw-semibold'
                      : 'border-light bg-white text-secondary'
                  }`}
                  style={{
                    cursor: 'pointer',
                    fontSize: '13px',
                    borderColor: method === m.id ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: method === m.id ? 'var(--primary-light)' : '#fff',
                    color: method === m.id ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                >
                  {m.label}
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="d-flex justify-content-end gap-2 pt-2 border-top flex-wrap flex-sm-nowrap">
            <Button
              type="button"
              variant="secondary"
              className="btn-saas btn-saas-secondary flex-grow-1 flex-sm-grow-0"
              style={{ minHeight: '44px' }}
              onClick={handleModalClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="btn-saas btn-saas-primary flex-grow-1 flex-sm-grow-0"
              style={{ minHeight: '44px' }}
            >
              <CheckCircle2 size={16} /> Record Payment
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default PaymentModal;
