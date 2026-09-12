import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, SAMPLE_USERS, SEED_PASSWORD } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Avatar from '../components/Avatar';
import Icon from '../components/Icon';

/*
 * Sign in.
 *
 * The four seeded accounts are offered as one click entries. Every role sees
 * a different application, and asking a reviewer to remember four addresses
 * and a password to discover that is a poor first impression. The credential
 * form is still the primary path.
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
    <AuthLayout>
      <div className="auth-card">
        <header className="auth-head">
          <h1>Sign in</h1>
          <p>Open your estate workspace.</p>
        </header>

        {error ? (
          <div className="alert alert-error" role="alert" style={{ marginBottom: 14 }}>
            <Icon name="alert" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <div className="label-row">
              <label htmlFor="signin-password">Password</label>
              <button type="button" className="text-btn" onClick={() => setShowPassword(!showPassword)}>
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
            <Link to="/forgot-password" className="text-btn" style={{ alignSelf: 'flex-start' }}>
              Forgotten your password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block">
            Sign in
          </button>
        </form>

        <div className="auth-divider">or open a demonstration account</div>

        <div className="persona-list">
          {SAMPLE_USERS.map((user) => {
            const name = `${user.first_name} ${user.last_name}`;
            return (
              <button key={user.id} type="button" className="persona" onClick={() => attempt(user.email, SEED_PASSWORD)}>
                <Avatar name={name} size="sm" />
                <span className="persona-text">
                  <span className="persona-name">{name}</span>
                  <span className="persona-role">{user.role}</span>
                </span>
                <span className="persona-go">
                  Open
                  <Icon name="chevronRight" />
                </span>
              </button>
            );
          })}
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Each role sees a different application. The password for all four is <span className="nums strong">{SEED_PASSWORD}</span>
        </p>

        <p className="auth-foot">
          No account yet? <Link to="/signup">Register your household</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default SignIn;
