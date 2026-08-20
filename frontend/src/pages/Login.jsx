import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, signup, switchUser, demoUsers, user } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('Resident');
  const [notice, setNotice] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email) {
      setNotice('Please enter an email address.');
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email || !firstName || !lastName) {
      setNotice('Please fill in your first name, last name, and email address.');
      return;
    }
    const res = await signup({
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone,
      address,
      role,
    });
    if (res.success) {
      setNotice('Account created successfully and verified!');
      setTimeout(() => navigate('/'), 1000);
    }
  };

  const handleQuickRoleSelect = (roleName) => {
    switchUser(roleName);
    setNotice(`Switched session to ${roleName}`);
    setTimeout(() => navigate('/'), 600);
  };

  return (
    <div className="stack" style={{ maxWidth: '580px', margin: '0 auto' }}>
      <header className="masthead" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s5)' }}>
        <div>
          <Logo />
          <h1 style={{ marginTop: 'var(--s3)', fontSize: '1.6rem' }}>
            {mode === 'signin' ? 'Sign in to CommuniKey' : 'Create an Account'}
          </h1>
          <p className="masthead-meta">
            {mode === 'signin'
              ? 'Access neighborhood alerts, announcements, events, and reports.'
              : 'Register your details to join Riverside Estate Community Platform.'}
          </p>
        </div>
      </header>

      {/* Quick Demo Role Switcher Bar */}
      <section className="panel" style={{ padding: 'var(--s4)', border: '1px solid var(--line-hi)' }}>
        <p className="eyebrow" style={{ marginBottom: 'var(--s2)' }}>
          Quick Demo Role Selection
        </p>
        <p className="sm faint" style={{ marginBottom: 'var(--s3)' }}>
          Click any role below to instantly switch sessions and experience how different users interact with the app:
        </p>
        <div className="cluster" style={{ gap: 'var(--s2)' }}>
          {demoUsers.map((u) => {
            const isActive = user && user.role === u.role;
            return (
              <button
                key={u.role}
                type="button"
                className={`btn${isActive ? ' btn-solid' : ''}`}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.75rem',
                  borderColor: isActive ? 'var(--signal)' : 'var(--line-hi)',
                  color: isActive ? '#fff' : 'var(--paper)',
                  backgroundColor: isActive ? 'var(--signal)' : 'transparent',
                }}
                onClick={() => handleQuickRoleSelect(u.role)}
              >
                {u.role} ({u.first_name})
              </button>
            );
          })}
        </div>
      </section>

      {notice ? <p className="notice">{notice}</p> : null}

      {/* Mode Switcher Tabs */}
      <div className="cluster" style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s3)' }}>
        <button
          type="button"
          className="link"
          style={{
            fontWeight: mode === 'signin' ? 600 : 400,
            color: mode === 'signin' ? 'var(--paper)' : 'var(--faint)',
            textDecoration: mode === 'signin' ? 'underline' : 'none',
          }}
          onClick={() => {
            setMode('signin');
            setNotice('');
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className="link"
          style={{
            fontWeight: mode === 'signup' ? 600 : 400,
            color: mode === 'signup' ? 'var(--paper)' : 'var(--faint)',
            textDecoration: mode === 'signup' ? 'underline' : 'none',
          }}
          onClick={() => {
            setMode('signup');
            setNotice('');
          }}
        >
          Create new account
        </button>
      </div>

      {mode === 'signin' ? (
        <form onSubmit={handleSignIn} className="stack" style={{ gap: 'var(--s5)' }}>
          <div className="field">
            <label className="eyebrow" htmlFor="signin-email">
              Email address
            </label>
            <input
              id="signin-email"
              type="email"
              className="control"
              placeholder="resident@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="cluster" style={{ marginTop: 'var(--s2)' }}>
            <button type="submit" className="btn btn-solid" style={{ minWidth: '140px' }}>
              Sign in
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSignUp} className="stack" style={{ gap: 'var(--s5)' }}>
          <div className="fields">
            <div className="field">
              <label className="eyebrow" htmlFor="signup-first">
                First name
              </label>
              <input
                id="signup-first"
                className="control"
                placeholder="Jane"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="eyebrow" htmlFor="signup-last">
                Last name
              </label>
              <input
                id="signup-last"
                className="control"
                placeholder="Resident"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="fields">
            <div className="field">
              <label className="eyebrow" htmlFor="signup-email">
                Email address
              </label>
              <input
                id="signup-email"
                type="email"
                className="control"
                placeholder="newresident@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="eyebrow" htmlFor="signup-phone">
                Phone number
              </label>
              <input
                id="signup-phone"
                className="control"
                placeholder="+27 82 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label className="eyebrow" htmlFor="signup-address">
              Street address
            </label>
            <input
              id="signup-address"
              className="control"
              placeholder="12 Riverside Drive"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="eyebrow" htmlFor="signup-role">
              Account Role
            </label>
            <select
              id="signup-role"
              className="control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ color: 'var(--paper)', backgroundColor: 'var(--ink)' }}
            >
              <option value="Resident">Resident</option>
              <option value="Safety Volunteer">Safety Volunteer</option>
              <option value="Community Administrator">Community Administrator</option>
              <option value="System Administrator">System Administrator</option>
            </select>
          </div>

          <div className="cluster" style={{ marginTop: 'var(--s2)' }}>
            <button type="submit" className="btn btn-solid" style={{ minWidth: '160px' }}>
              Create Account
            </button>
            <span className="mono sm faint">Verified upon creation</span>
          </div>
        </form>
      )}
    </div>
  );
}

export default Login;
