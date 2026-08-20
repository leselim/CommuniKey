import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import Announcements from './pages/Announcements';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Incidents from './pages/Incidents';
import Login from './pages/Login';
import Profile from './pages/Profile';

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
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="view">
            <div className="shell">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/incidents" element={<Incidents />} />
                <Route path="/announcements" element={<Announcements />} />
                <Route path="/events" element={<Events />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
