import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import api from '../api/axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/login', {
        username: username.trim(),
        password: password.trim(),
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid username or password. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 p-3"
      style={{ backgroundColor: 'var(--bg-main)' }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            className="brand-icon-box mx-auto mb-3"
            style={{ width: '48px', height: '48px', borderRadius: '14px' }}
          >
            <Wrench size={26} />
          </div>
          <h1 className="fs-3 fw-bold mb-1" style={{ letterSpacing: '-0.02em' }}>
            Gayatri Workshop
          </h1>
          <p className="text-secondary small">
            Workshop & Job Card Management Platform
          </p>
        </div>

        {/* Login Card */}
        <div className="saas-card p-3 p-sm-4 p-md-5 shadow-sm">
          <div className="mb-4">
            <h2 className="fs-5 fw-bold mb-1">Welcome back</h2>
            <p className="text-secondary small mb-0">
              Sign in with your staff or administrator credentials
            </p>
          </div>

          {error && (
            <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label-saas">Username</label>
              <div className="position-relative">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  className="form-control-saas"
                  style={{ paddingLeft: '34px' }}
                />
                <User
                  size={15}
                  className="position-absolute text-tertiary"
                  style={{ left: '11px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label-saas">Password</label>
              <div className="position-relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-control-saas"
                  style={{ paddingLeft: '34px', paddingRight: '36px' }}
                />
                <Lock
                  size={15}
                  className="position-absolute text-tertiary"
                  style={{ left: '11px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-link btn-sm position-absolute text-secondary p-0"
                  style={{
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    textDecoration: 'none',
                  }}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-saas btn-saas-primary w-100 py-2 fs-6 fw-semibold mb-3"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

        </div>

        {/* Security / Copyright Footer */}
        <div className="text-center mt-4 text-secondary small d-flex align-items-center justify-content-center gap-1">
          <ShieldCheck size={14} className="text-success" />
          <span>Secure Enterprise Workshop Portal</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
