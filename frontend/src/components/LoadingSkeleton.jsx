import React from 'react';

const LoadingSkeleton = ({ type = 'table', rows = 5 }) => {
  if (type === 'cards') {
    return (
      <div className="row g-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-3">
            <div className="stat-card-saas p-4">
              <div style={{ flex: 1 }}>
                <div className="skeleton-pulse mb-2" style={{ width: '60%', height: '14px' }}></div>
                <div className="skeleton-pulse" style={{ width: '80%', height: '28px' }}></div>
              </div>
              <div
                className="skeleton-pulse"
                style={{ width: '44px', height: '44px', borderRadius: '12px' }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="form-section-card p-4">
        <div className="skeleton-pulse mb-4" style={{ width: '200px', height: '20px' }}></div>
        <div className="row g-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="col-md-4">
              <div className="skeleton-pulse mb-2" style={{ width: '40%', height: '12px' }}></div>
              <div className="skeleton-pulse" style={{ width: '100%', height: '38px' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className="saas-table-container">
      <div className="p-3 border-bottom d-flex gap-3">
        <div className="skeleton-pulse" style={{ width: '240px', height: '34px' }}></div>
        <div className="skeleton-pulse ms-auto" style={{ width: '120px', height: '34px' }}></div>
      </div>
      <div className="p-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="d-flex align-items-center py-3 border-bottom gap-3">
            <div className="skeleton-pulse" style={{ width: '12%', height: '16px' }}></div>
            <div className="skeleton-pulse" style={{ width: '15%', height: '16px' }}></div>
            <div className="skeleton-pulse" style={{ width: '15%', height: '16px' }}></div>
            <div className="skeleton-pulse" style={{ width: '20%', height: '16px' }}></div>
            <div className="skeleton-pulse" style={{ width: '12%', height: '16px' }}></div>
            <div className="skeleton-pulse" style={{ width: '10%', height: '16px' }}></div>
            <div className="skeleton-pulse ms-auto" style={{ width: '80px', height: '28px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;

