import React, { useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Shield,
  Activity,
} from 'lucide-react';
import api from '../api/axios';

const Profile = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'danger', text: 'All password fields are required.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({
        type: 'danger',
        text: 'New Password and Confirm Password do not match.',
      });
      return;
    }
    if (newPassword.length < 4) {
      setMessage({
        type: 'danger',
        text: 'New Password must be at least 4 characters long.',
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/auth/change-password', {
        username: user.username || 'admin',
        currentPassword,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Your password has been updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Error updating password. Verify current password.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-saas">
        <div>
          <h1 className="page-title">Account & Security</h1>
          <p className="page-subtitle">
            Manage your personal profile information, system role, and security credentials.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`alert alert-${message.type} py-2 px-3 small d-flex align-items-center gap-2 mb-4`}
        >
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Account Profile Overview */}
        <div className="col-12 col-lg-5">
          <div className="saas-card mb-4">
            <div className="saas-card-header">
              <div className="saas-card-title">
                <User size={18} className="text-primary" />
                <span>Profile Details</span>
              </div>
            </div>

            <div className="saas-card-body">
              <div className="d-flex align-items-center gap-3 mb-4 pb-4 border-bottom">
                <div
                  className="user-avatar-circle"
                  style={{
                    width: '56px',
                    height: '56px',
                    fontSize: '20px',
                    backgroundColor: 'var(--primary)',
                  }}
                >
                  {getInitials(user?.name || user?.username)}
                </div>
                <div>
                  <h3 className="fs-5 fw-bold mb-1">{user?.name || user?.username || 'Administrator'}</h3>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary-light text-primary border border-primary-subtle">
                      {user?.role || 'Administrator'}
                    </span>
                    <span className="small text-success d-flex align-items-center gap-1">
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--success)',
                        }}
                      />
                      Active Session
                    </span>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-secondary small">Username</span>
                  <span className="fw-semibold">{user?.username || 'admin'}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-secondary small">Assigned Role</span>
                  <span className="fw-medium">{user?.role || 'Admin'}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-secondary small">Access Level</span>
                  <span className="fw-medium text-primary">Full System Access</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-secondary small">Permissions</span>
                  <span className="text-secondary small text-end">
                    Create, Edit, Delete, Payment Processing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password */}
        <div className="col-12 col-lg-7">
          <div className="saas-card">
            <div className="saas-card-header">
              <div className="saas-card-title">
                <Lock size={18} className="text-primary" />
                <span>Security & Password</span>
              </div>
            </div>

            <div className="saas-card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label-saas">
                    Current Password<span className="required-star">*</span>
                  </label>
                  <div className="position-relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="form-control-saas"
                      style={{ paddingRight: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="btn btn-link btn-sm position-absolute text-secondary p-0"
                      style={{
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        textDecoration: 'none',
                      }}
                      tabIndex="-1"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="row g-3 mb-4">
                  <div className="col-12 col-sm-6">
                    <label className="form-label-saas">
                      New Password<span className="required-star">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="form-control-saas"
                        style={{ paddingRight: '36px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="btn btn-link btn-sm position-absolute text-secondary p-0"
                        style={{
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          textDecoration: 'none',
                        }}
                        tabIndex="-1"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6">
                    <label className="form-label-saas">
                      Confirm New Password<span className="required-star">*</span>
                    </label>
                    <div className="position-relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-type new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="form-control-saas"
                        style={{ paddingRight: '36px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="btn btn-link btn-sm position-absolute text-secondary p-0"
                        style={{
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          textDecoration: 'none',
                        }}
                        tabIndex="-1"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end pt-3 border-top">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-saas btn-saas-primary px-4 py-2 w-100 w-sm-auto"
                    style={{ minHeight: '44px' }}
                  >
                    <KeyRound size={16} />
                    <span>{submitting ? 'Updating Password...' : 'Update Password'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
