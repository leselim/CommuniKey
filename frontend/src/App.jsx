import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import Announcements from './pages/Announcements';
import Events from './pages/Events';
import Members from './pages/Members';
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
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="view">
          <div className="shell">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/events" element={<Events />} />
              <Route path="/messages" element={<Members />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
