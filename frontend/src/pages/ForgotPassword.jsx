import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import Icon from '../components/Icon';

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
    <AuthLayout>
      <div className="auth-card">
        <header className="auth-head">
          <h1>Reset your password</h1>
          <p>Enter the email address you registered with and we will send recovery instructions.</p>
        </header>

        {submitted ? (
          <div className="auth-form">
            <div className="alert alert-ok" role="status">
              <Icon name="mail" />
              <span>{message}</span>
            </div>
            <p className="hint">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. It can take a few minutes to arrive.
            </p>
            <Link to="/signin" className="btn btn-primary btn-lg btn-block">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="reset-email">Email address</label>
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

            <button type="submit" className="btn btn-primary btn-lg btn-block">
              Send reset instructions
            </button>
          </form>
        )}

        <p className="auth-foot">
          Remembered it? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
