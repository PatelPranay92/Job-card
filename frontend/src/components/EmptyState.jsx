import React from 'react';
import { Button } from 'react-bootstrap';

const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state-card">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h4 className="empty-state-title">{title}</h4>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <Button variant="primary" className="btn-saas btn-saas-primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

