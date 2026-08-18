import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, UserPlus, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'RESIDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: formData.email,
        username: formData.username || formData.email.split('@')[0],
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        password: formData.password,
        confirm_password: formData.confirm_password,
        role: formData.role
      });
      navigate('/login');
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes?.errors) {
        const firstKey = Object.keys(errRes.errors)[0];
        setError(`${firstKey}: ${errRes.errors[firstKey][0]}`);
      } else {
        setError(errRes?.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '0 16px' }}>
      <div className="card" style={{ padding: '28px', borderTop: '4px solid #0f172a' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            background: '#0f172a',
            color: '#ffffff',
            width: '42px',
            height: '42px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px auto'
          }}>
            <ShieldAlert size={22} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Register Resident Account
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Join the Pinelands Neighborhood Safety Network
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', textTransform: 'none', fontSize: '0.825rem', display: 'block' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                name="email"
                className="form-input"
                required
                placeholder="thabo.mokoena@communitycloud.co.za"
                value={formData.email}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="first_name"
                className="form-input"
                required
                placeholder="Thabo"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                name="last_name"
                className="form-input"
                required
                placeholder="Mokoena"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Contact Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="phone_number"
                className="form-input"
                placeholder="082 345 6789"
                value={formData.phone_number}
                onChange={handleChange}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <select
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="RESIDENT">Pinelands Resident</option>
              <option value="COMMUNITY_ADMIN">Community Administrator</option>
              <option value="SAFETY_VOLUNTEER">Neighborhood Patrol Volunteer</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirm_password"
                className="form-input"
                required
                minLength={6}
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px', gap: '6px' }} disabled={loading}>
            <UserPlus size={16} /> {loading ? 'Registering...' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Already registered? <Link to="/login" style={{ fontWeight: '600', color: '#1e40af' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
