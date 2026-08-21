import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Announcements from './pages/Announcements';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Incidents from './pages/Incidents';
import Members from './pages/Members';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';

function NotFound() {
  return (
    <div className="stack">
      <header className="masthead">
        <div>
          <p className="eyebrow">404</p>
          <h1>Page not found</h1>
          <p className="masthead-meta">That page does not exist on this platform.</p>
        </div>
        <Link to="/" className="link">
          Back to dashboard
        </Link>
      </header>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="view">
            <div className="shell">
              <Routes>
                <Route path="/signin" element={<SignIn />} />
                <Route path="/login" element={<SignIn />} />

                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/incidents"
                  element={
                    <ProtectedRoute allowedRoles={['Resident', 'Community Administrator', 'Safety Volunteer']}>
                      <Incidents />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/announcements"
                  element={
                    <ProtectedRoute allowedRoles={['Resident', 'Community Administrator']}>
                      <Announcements />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events"
                  element={
                    <ProtectedRoute allowedRoles={['Resident', 'Community Administrator']}>
                      <Events />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Members />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
