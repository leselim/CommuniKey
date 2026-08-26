import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    password: '',
    confirm_password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (form.password !== form.confirm_password) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    const result = register(form);
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="stack" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <header className="masthead">
        <div>
          <p className="eyebrow">
            CommuniKey Registration
          </p>
          <h1>Create Resident Account</h1>
          <p className="masthead-meta">
            Register your estate household account for community verification & emergency access.
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

      <form
        onSubmit={handleSubmit}
        className="panel stack"
        style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', gap: 'var(--s4)' }}
      >
        <div className="cluster" style={{ gap: 'var(--s3)' }}>
          <div className="field" style={{ flex: 1 }}>
            <label className="eyebrow" htmlFor="first_name">
              First Name *
            </label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              className="control"
              placeholder="e.g., Elena"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field" style={{ flex: 1 }}>
            <label className="eyebrow" htmlFor="last_name">
              Last Name *
            </label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              className="control"
              placeholder="e.g., Rostova"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="eyebrow" htmlFor="email">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="control"
            placeholder="elena@example.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="cluster" style={{ gap: 'var(--s3)' }}>
          <div className="field" style={{ flex: 1 }}>
            <label className="eyebrow" htmlFor="phone_number">
              Phone Number
            </label>
            <input
              id="phone_number"
              name="phone_number"
              type="text"
              className="control"
              placeholder="+27 82 123 4567"
              value={form.phone_number}
              onChange={handleChange}
            />
          </div>

          <div className="field" style={{ flex: 1 }}>
            <label className="eyebrow" htmlFor="address">
              Estate Unit / Address
            </label>
            <input
              id="address"
              name="address"
              type="text"
              className="control"
              placeholder="e.g., 14 Riverside Drive"
              value={form.address}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '4px' }}>
            <label className="eyebrow" htmlFor="password">
              Password *
            </label>
            <button
              type="button"
              className="link sm"
              style={{ fontSize: '0.75rem', color: 'var(--dim)', border: 'none', background: 'none' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide Password' : 'Show Password'}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="control"
            placeholder="Minimum 6 characters"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label className="eyebrow" htmlFor="confirm_password">
            Confirm Password *
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type={showPassword ? 'text' : 'password'}
            className="control"
            placeholder="Re-enter password"
            value={form.confirm_password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-solid" style={{ width: '100%', padding: '0.6rem', marginTop: 'var(--s2)' }}>
          Create Resident Account
        </button>

        <p className="sm faint" style={{ textAlign: 'center', marginTop: 'var(--s2)' }}>
          Already have an account?{' '}
          <Link to="/signin" className="link" style={{ color: 'var(--paper)', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
