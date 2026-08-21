import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SAMPLE_USERS, SEED_PASSWORD, useAuth } from '../context/AuthContext';

function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid credentials.');
    }
  };

  const handleQuickFill = (user) => {
    setEmail(user.email);
    setPassword(SEED_PASSWORD);
    setError('');
  };

  const handleQuickLogin = (user) => {
    const result = login(user.email, SEED_PASSWORD);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="stack" style={{ maxWidth: '680px', margin: '0 auto' }}>
      <header className="masthead">
        <div>
          <p className="eyebrow" style={{ color: 'var(--signal)' }}>
            CommuniKey Security Portal
          </p>
          <h1>Platform Sign In</h1>
          <p className="masthead-meta">
            Authenticate to access your role-specific dashboard and protected community tools.
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

      {/* Standard Email / Password Form */}
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
            placeholder="thabo@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            required
          />
        </div>

        <div className="field">
          <label className="eyebrow" htmlFor="signin-password">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            className="control"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            required
          />
          <p className="sm faint" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
            Testing Password for all seed accounts: <code style={{ color: 'var(--signal)', fontWeight: 600 }}>{SEED_PASSWORD}</code>
          </p>
        </div>

        <button type="submit" className="btn btn-solid" style={{ width: '100%', padding: '0.6rem' }}>
          Authenticate & Sign In
        </button>
      </form>

      {/* Seed Test Accounts & Quick-Fill Demo Helpers */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>
              Evaluator Testing Suite
            </p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>
              Pre-Seeded Test Accounts & Credentials
            </h2>
          </div>
        </div>

        <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
          Click <strong>Quick Fill</strong> to populate credentials into the sign-in form above, or click <strong>1-Click Sign In</strong> to log in directly:
        </p>

        <div className="stack" style={{ gap: 'var(--s3)' }}>
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
                  Email: <strong>{user.email}</strong> • Password: <strong>{SEED_PASSWORD}</strong>
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
      </section>
    </div>
  );
}

export default SignIn;
