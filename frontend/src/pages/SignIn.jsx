import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { SAMPLE_USERS, SEED_PASSWORD, useAuth } from '../context/AuthContext';

function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Tucked-away developer testing modal drawer state
  const [devSandboxOpen, setDevSandboxOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = (user) => {
    setEmail(user.email);
    setPassword(SEED_PASSWORD);
    setError('');
    setDevSandboxOpen(false);
  };

  const handleQuickLogin = (user) => {
    const result = login(user.email, SEED_PASSWORD);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="stack" style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Masthead Header */}
      <header className="masthead" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            CommuniKey Security
          </p>
          <h1 style={{ fontSize: 'var(--fs-xl)' }}>Sign In</h1>
          <p className="masthead-meta">
            Enter your credentials to access your estate community workspace.
          </p>
        </div>
      </header>

      {error ? (
        <div
          className="panel"
          style={{
            padding: 'var(--s3) var(--s4)',
            backgroundColor: 'var(--panel-hi)',
            borderLeft: '3px solid var(--signal)',
          }}
        >
          <p className="sm" style={{ color: 'var(--paper)', margin: 0 }}>
            {error}
          </p>
        </div>
      ) : null}

      {/* Production-Grade Sign In Form */}
      <form
        onSubmit={handleSubmit}
        className="panel stack"
        style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', gap: 'var(--s4)' }}
      >
        <div className="field">
          <label className="eyebrow" htmlFor="signin-email">
            Email Address
          </label>
          <input
            id="signin-email"
            type="email"
            className="control"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
            autoComplete="email"
          />
        </div>

        <div className="field">
          <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
            <label className="eyebrow" htmlFor="signin-password">
              Password
            </label>
            <button
              type="button"
              className="link sm"
              style={{ fontSize: '0.75rem', color: 'var(--dim)', border: 'none', background: 'none', cursor: 'pointer' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="signin-password"
            type={showPassword ? 'text' : 'password'}
            className="control"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            required
            autoComplete="current-password"
          />
        </div>

        {/* Remember Me & Forgot Password Row */}
        <div className="cluster" style={{ justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
          <label className="cluster" style={{ gap: 'var(--s2)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ accentColor: 'var(--signal)' }}
            />
            <span className="sm faint" style={{ color: 'var(--paper)' }}>
              Remember Me
            </span>
          </label>

          <Link to="/forgot-password" className="link sm" style={{ color: 'var(--dim)' }}>
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="btn btn-solid" style={{ width: '100%', padding: '0.6rem', marginTop: 'var(--s2)' }}>
          Sign In
        </button>

        <p className="sm faint" style={{ textAlign: 'center', marginTop: 'var(--s2)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="link" style={{ color: 'var(--paper)', fontWeight: 600 }}>
            Create an Account
          </Link>
        </p>
      </form>

      {/* Discreet, Tucked-Away Developer Sandbox Switcher Button */}
      <div style={{ textAlign: 'center', marginTop: 'var(--s4)' }}>
        <button
          type="button"
          className="btn"
          style={{
            fontSize: '0.75rem',
            padding: '0.3rem 0.7rem',
            borderColor: 'var(--line-hi)',
            color: 'var(--dim)',
          }}
          onClick={() => setDevSandboxOpen(true)}
        >
          Developer Sandbox / Seed Profiles
        </button>
      </div>

      {/* Developer Sandbox Floating Modal */}
      {devSandboxOpen ? (
        <Modal
          title="Developer Testing Sandbox & Seed Profiles"
          onClose={() => setDevSandboxOpen(false)}
          footer={
            <button type="button" className="btn" onClick={() => setDevSandboxOpen(false)}>
              Close Sandbox
            </button>
          }
        >
          <div className="stack" style={{ gap: 'var(--s3)' }}>
            <p className="sm faint">
              Click <strong>Quick Fill</strong> to populate credentials into the form, or click <strong>1-Click Sign In</strong> to log in directly as any persona:
            </p>
            <p className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.75rem', fontWeight: 600 }}>
              Testing Password for all accounts: {SEED_PASSWORD}
            </p>

            <div className="stack" style={{ gap: 'var(--s3)', marginTop: 'var(--s2)' }}>
              {SAMPLE_USERS.map((user) => (
                <div
                  key={user.id}
                  style={{
                    padding: 'var(--s3) var(--s4)',
                    backgroundColor: 'var(--panel-hi)',
                    border: '1px solid var(--line-hi)',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--s3)',
                  }}
                >
                  <div>
                    <div className="cluster" style={{ gap: 'var(--s2)', marginBottom: '2px' }}>
                      <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                        {user.first_name} {user.last_name}
                      </strong>
                      <span
                        className="mono sm"
                        style={{
                          color: 'var(--signal)',
                          backgroundColor: 'var(--signal-wash)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="mono sm" style={{ color: 'var(--dim)', margin: 0, fontSize: '0.75rem' }}>
                      {user.email}
                    </p>
                  </div>

                  <div className="cluster" style={{ gap: 'var(--s2)' }}>
                    <button
                      type="button"
                      className="btn"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                      onClick={() => handleQuickFill(user)}
                    >
                      Quick Fill
                    </button>
                    <button
                      type="button"
                      className="btn btn-solid"
                      style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                      onClick={() => handleQuickLogin(user)}
                    >
                      1-Click Sign In
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default SignIn;
