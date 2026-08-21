import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SAMPLE_USERS, useAuth } from '../context/AuthContext';

function SignIn() {
  const { login, loginAsPersona } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    const result = login(email, password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError('Invalid credentials. Please check your email or select a sample persona below.');
    }
  };

  const handlePersonaSelect = (roleName) => {
    loginAsPersona(roleName);
    navigate('/', { replace: true });
  };

  return (
    <div className="stack" style={{ maxWidth: '640px', margin: '0 auto' }}>
      <header className="masthead">
        <div>
          <p className="eyebrow">CommuniKey Security</p>
          <h1>Platform Sign In</h1>
          <p className="masthead-meta">
            Authenticate to access your role-specific dashboard and community tools.
          </p>
        </div>
      </header>

      {error ? (
        <div
          className="panel"
          style={{
            padding: 'var(--s3) var(--s4)',
            backgroundColor: 'var(--panel-hi)',
            borderLeft: '2px solid var(--signal)',
          }}
        >
          <p className="sm" style={{ color: 'var(--paper)' }}>
            {error}
          </p>
        </div>
      ) : null}

      {/* Standard Email / Password Form */}
      <form onSubmit={handleSubmit} className="panel stack" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)', gap: 'var(--s4)' }}>
        <div className="field">
          <label className="eyebrow" htmlFor="signin-email">
            Email Address
          </label>
          <input
            id="signin-email"
            type="email"
            className="control"
            placeholder="resident@example.com"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
          />
        </div>

        <button type="submit" className="btn btn-solid" style={{ width: '100%', padding: '0.6rem' }}>
          Sign In
        </button>
      </form>

      {/* Quick Role Persona Switcher Card */}
      <section className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
        <div className="panel-head" style={{ marginBottom: 'var(--s3)' }}>
          <div>
            <p className="eyebrow">Evaluator Role Selector</p>
            <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 500 }}>
              1-Click Sign In as Any Role Persona
            </h2>
          </div>
        </div>

        <p className="sm faint" style={{ marginBottom: 'var(--s4)' }}>
          Test the tailored dashboard, navigation, permissions, and controls for each community role:
        </p>

        <div className="stack" style={{ gap: 'var(--s3)' }}>
          {SAMPLE_USERS.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handlePersonaSelect(user.role)}
              style={{
                textAlign: 'left',
                padding: 'var(--s3) var(--s4)',
                backgroundColor: 'var(--panel-hi)',
                border: '1px solid var(--line-hi)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'block',
                width: '100%',
              }}
            >
              <div className="cluster" style={{ justifyContent: 'space-between', marginBottom: '2px' }}>
                <strong style={{ fontSize: 'var(--fs-sm)', color: 'var(--paper)' }}>
                  {user.first_name} {user.last_name}
                </strong>
                <span className="mono sm" style={{ color: 'var(--signal)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {user.role}
                </span>
              </div>
              <p className="sm faint" style={{ color: 'var(--dim)', margin: 0 }}>
                {user.email} • {user.address}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SignIn;
