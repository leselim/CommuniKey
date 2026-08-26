import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const result = resetPassword(email);
    setMessage(result.message);
    setSubmitted(true);
  };

  return (
    <div className="stack" style={{ maxWidth: '520px', margin: '0 auto' }}>
      <header className="masthead">
        <div>
          <p className="eyebrow">
            Account Recovery
          </p>
          <h1>Password Reset</h1>
          <p className="masthead-meta">
            Enter your registered email address to receive password recovery instructions.
          </p>
        </div>
      </header>

      {submitted ? (
        <div className="panel stack" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', gap: 'var(--s4)' }}>
          <p className="notice" style={{ margin: 0 }}>
            {message}
          </p>
          <p className="sm faint">
            If an account exists for <strong>{email}</strong>, password reset links have been generated cleanly.
          </p>
          <div className="cluster" style={{ justifyContent: 'center' }}>
            <Link to="/signin" className="btn btn-solid" style={{ padding: '0.5rem 1rem' }}>
              Return to Sign In
            </Link>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="panel stack"
          style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', gap: 'var(--s4)' }}
        >
          <div className="field">
            <label className="eyebrow" htmlFor="reset-email">
              Registered Email Address
            </label>
            <input
              id="reset-email"
              type="email"
              className="control"
              placeholder="thabo@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-solid" style={{ width: '100%', padding: '0.6rem' }}>
            Send Reset Instructions
          </button>

          <p className="sm faint" style={{ textAlign: 'center', marginTop: 'var(--s2)' }}>
            Remembered your password?{' '}
            <Link to="/signin" className="link" style={{ color: 'var(--paper)', fontWeight: 600 }}>
              Return to Sign In
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
