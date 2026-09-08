import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/*
 * Household registration.
 *
 * Errors are reported per field rather than as a single line at the top,
 * so a person can see which box to go back to. Validation runs on submit
 * and then re-checks a field as it is corrected.
 */

const MIN_PASSWORD = 8;

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
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (values) => {
    const found = {};
    if (!values.first_name.trim()) found.first_name = 'Enter your first name.';
    if (!values.last_name.trim()) found.last_name = 'Enter your last name.';

    if (!values.email.trim()) found.email = 'Enter your email address.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      found.email = 'That does not look like an email address.';
    }

    if (!values.address.trim()) {
      found.address = 'Enter your street address so patrols can find you.';
    }

    if (!values.password) found.password = 'Choose a password.';
    else if (values.password.length < MIN_PASSWORD) {
      found.password = `Use at least ${MIN_PASSWORD} characters.`;
    }

    if (values.confirm_password !== values.password) {
      found.confirm_password = 'This does not match the password above.';
    }

    return found;
  };

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);

    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      const el = document.getElementById(`signup-${firstBad.replace(/_/g, '-')}`);
      if (el) el.focus();
      return;
    }

    const result = register(form);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrors({ email: result.message || 'That account could not be created.' });
    }
  };

  const fieldError = (key) =>
    errors[key] ? (
      <span className="hint" style={{ color: 'var(--alert)' }}>
        {errors[key]}
      </span>
    ) : null;

  return (
    <div className="auth">
      <div className="auth-card auth-card-wide">
        <header className="auth-head">
          <h1>Register your household</h1>
          <p>
            Estate management verifies every application against the resident register before
            granting access.
          </p>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="fields">
            <div className="field">
              <label htmlFor="signup-first-name">First name</label>
              <input
                id="signup-first-name"
                name="first_name"
                className="control"
                autoComplete="given-name"
                value={form.first_name}
                onChange={handleChange}
                aria-invalid={errors.first_name ? 'true' : undefined}
              />
              {fieldError('first_name')}
            </div>

            <div className="field">
              <label htmlFor="signup-last-name">Last name</label>
              <input
                id="signup-last-name"
                name="last_name"
                className="control"
                autoComplete="family-name"
                value={form.last_name}
                onChange={handleChange}
                aria-invalid={errors.last_name ? 'true' : undefined}
              />
              {fieldError('last_name')}
            </div>

            <div className="field">
              <label htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                className="control"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                aria-invalid={errors.email ? 'true' : undefined}
              />
              {fieldError('email')}
            </div>

            <div className="field">
              <label htmlFor="signup-phone-number">Phone number</label>
              <input
                id="signup-phone-number"
                name="phone_number"
                type="tel"
                className="control"
                autoComplete="tel"
                placeholder="+27 82 000 0000"
                value={form.phone_number}
                onChange={handleChange}
              />
            </div>

            <div className="field field-wide">
              <label htmlFor="signup-address">Street address</label>
              <input
                id="signup-address"
                name="address"
                className="control"
                autoComplete="street-address"
                placeholder="22 Riverside Drive, Section A"
                value={form.address}
                onChange={handleChange}
                aria-invalid={errors.address ? 'true' : undefined}
              />
              {fieldError('address') || (
                <span className="hint">Used to route patrols and emergency response.</span>
              )}
            </div>

            <div className="field">
              <div className="spread" style={{ gap: 'var(--s2)' }}>
                <label htmlFor="signup-password">Password</label>
                <button
                  type="button"
                  className="btn btn-quiet btn-sm"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="control"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                aria-invalid={errors.password ? 'true' : undefined}
              />
              {fieldError('password') || (
                <span className="hint">At least {MIN_PASSWORD} characters.</span>
              )}
            </div>

            <div className="field">
              <label htmlFor="signup-confirm-password">Confirm password</label>
              <input
                id="signup-confirm-password"
                name="confirm_password"
                type={showPassword ? 'text' : 'password'}
                className="control"
                autoComplete="new-password"
                value={form.confirm_password}
                onChange={handleChange}
                aria-invalid={errors.confirm_password ? 'true' : undefined}
              />
              {fieldError('confirm_password')}
            </div>
          </div>

          <button type="submit" className="btn btn-solid btn-block" style={{ marginTop: 'var(--s5)' }}>
            Create account
          </button>
        </form>

        <p className="auth-foot">
          Already registered? <Link to="/signin">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
