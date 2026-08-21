import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div className="stack">
        <header className="masthead">
          <div>
            <p className="eyebrow" style={{ color: 'var(--signal)' }}>Access Restricted</p>
            <h1>Role Permission Required</h1>
            <p className="masthead-meta">
              Your account ({userRole}) does not have permission to view this section.
            </p>
          </div>
        </header>

        <div className="panel" style={{ padding: 'var(--s5)', border: '1px solid var(--line-hi)' }}>
          <p className="sm faint" style={{ color: 'var(--paper)', marginBottom: 'var(--s3)' }}>
            This feature is restricted to <strong>{allowedRoles.join(', ')}</strong> roles. You have been safely prevented from unauthorized access.
          </p>
          <div className="cluster">
            <Navigate to="/" replace />
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
