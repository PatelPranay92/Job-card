import React from 'react';

const StatCard = ({
  icon,
  label,
  value,
  color = 'primary',
  subtitle,
  onClick,
}) => {
  return (
    <div
      className="stat-card-saas"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div className="stat-subtext">{subtitle}</div>}
      </div>
      <div className={`stat-icon-wrapper stat-icon-${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;

