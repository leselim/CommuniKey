import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="stack" style={{ maxWidth: '460px', margin: '0 auto' }}>
      {/* Masthead Header */}
      <header className="masthead" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div>
          <p className="eyebrow">
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
    </div>
  );
}

export default SignIn;
