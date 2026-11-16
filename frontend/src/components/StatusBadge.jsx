import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const normStatus = (status || '').toLowerCase();

  let badgeClass = 'status-badge-neutral';
  let label = status || 'Unknown';

  if (normStatus === 'paid') {
    badgeClass = 'status-badge-paid';
    label = 'Paid';
  } else if (normStatus === 'partial') {
    badgeClass = 'status-badge-partial';
    label = 'Partial';
  } else if (normStatus === 'unpaid') {
    badgeClass = 'status-badge-unpaid';
    label = 'Unpaid';
  } else if (normStatus === 'pending') {
    badgeClass = 'status-badge-partial';
    label = 'Pending';
  }

  return (
    <span className={`status-badge-saas ${badgeClass} ${size === 'sm' ? 'text-xs py-0.5' : ''}`}>
      <span className="status-dot"></span>
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;

