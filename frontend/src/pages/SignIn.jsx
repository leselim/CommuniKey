import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SAMPLE_USERS, SEED_PASSWORD } from '../context/AuthContext';
import Avatar from '../components/Avatar';

/*
 * Sign in.
 *
 * The four seeded accounts are offered as one-click entries. Every role in
 * this system sees a different application, and asking a reviewer to
 * remember four addresses and a password to find that out is a poor first
 * impression. The normal credential form is still the primary path.
 */

function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const attempt = (emailValue, passwordValue) => {
    const result = login(emailValue, passwordValue);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'That email and password do not match an account.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter the email address you registered with.');
      return;
    }
    attempt(email, password);
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <header className="auth-head">
          <h1>Sign in</h1>
          <p>Access your estate workspace.</p>
        </header>

        {error ? <p className="error">{error}</p> : null}

        <form onSubmit={handleSubmit} className="stack" style={{ gap: 'var(--s4)' }}>
          <div className="field">
            <label htmlFor="signin-email">Email address</label>
            <input
              id="signin-email"
              type="email"
              className="control"
              placeholder="name@riverside.co.za"
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
            <div className="spread" style={{ gap: 'var(--s2)' }}>
              <label htmlFor="signin-password">Password</label>
              <button type="button" className="btn-quiet btn btn-sm" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              className="control"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="spread">
            <Link to="/forgot-password" className="link">
              Forgotten your password?
            </Link>
          </div>

          <button type="submit" className="btn btn-solid btn-block">
            Sign in
          </button>
        </form>

        <section style={{ marginTop: 'var(--s6)' }}>
          <div className="section-head" style={{ marginBottom: 'var(--s3)' }}>
            <h2 style={{ fontSize: 'var(--fs-base)' }}>Or open a demonstration account</h2>
          </div>
          <p className="hint" style={{ marginBottom: 'var(--s3)' }}>
            Each role sees a different application. Password for all four is{' '}
            <span className="nums">{SEED_PASSWORD}</span>.
          </p>

          <div className="persona-list">
            {SAMPLE_USERS.map((user) => {
              const name = `${user.first_name} ${user.last_name}`;
              return (
                <button
                  key={user.id}
                  type="button"
                  className="persona"
                  onClick={() => attempt(user.email, SEED_PASSWORD)}
                >
                  <Avatar name={name} size="sm" />
                  <span className="persona-text">
                    <span className="persona-name">{name}</span>
                    <span className="persona-role">{user.role}</span>
                  </span>
                  <span className="persona-go">Open</span>
                </button>
              );
            })}
          </div>
        </section>

        <p className="auth-foot">
          No account yet? <Link to="/signup">Register your household</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
