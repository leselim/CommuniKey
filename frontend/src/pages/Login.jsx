import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid email address or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto', padding: '0 16px' }}>
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
            Pinelands Community Sign In
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            Access safety alerts, notices & local directory
          </p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', textTransform: 'none', fontSize: '0.825rem', display: 'block' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="form-input"
                required
                placeholder="sibusiso.dlamini@communitycloud.co.za"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="form-input"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px', padding: '10px', gap: '6px' }} disabled={loading}>
            <LogIn size={16} /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: '600', color: '#1e40af' }}>Register New Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
