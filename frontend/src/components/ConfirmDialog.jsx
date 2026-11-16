import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  show,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Body className="p-4 text-center">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: confirmVariant === 'danger' ? 'var(--danger-light)' : 'var(--primary-light)',
            color: confirmVariant === 'danger' ? 'var(--danger)' : 'var(--primary)',
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <h5 className="fw-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h5>
        <p className="text-secondary small mb-4">{message}</p>
        <div className="d-flex justify-content-center gap-2 flex-wrap flex-sm-nowrap">
          <Button
            variant="secondary"
            className="btn-saas btn-saas-secondary flex-grow-1 flex-sm-grow-0"
            style={{ minHeight: '44px' }}
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            className={`btn-saas ${confirmVariant === 'danger' ? 'btn-saas-danger' : 'btn-saas-primary'} flex-grow-1 flex-sm-grow-0`}
            style={{ minHeight: '44px' }}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmDialog;

