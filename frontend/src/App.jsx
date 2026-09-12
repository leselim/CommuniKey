import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { EmptyState } from './components/ui';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import Announcements from './pages/Announcements';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import ForgotPassword from './pages/ForgotPassword';
import Incidents from './pages/Incidents';
import MemberModeration from './pages/MemberModeration';
import Directory from './pages/Directory';
import Insights from './pages/Insights';
import PatrolOps from './pages/PatrolOps';
import Profile from './pages/Profile';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function NotFound() {
  return (
    <div className="page">
      <section className="card">
        <EmptyState
          icon="info"
          title="Page not found"
          text="That page does not exist on this platform."
          action={
            <Link to="/" className="btn btn-primary">
              Back to home
            </Link>
          }
        />
      </section>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/incidents"
              element={
                <ProtectedRoute allowedRoles={['Resident', 'Estate Administrator', 'Safety Volunteer', 'Security Guard']}>
                  <Incidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/incidents"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator']}>
                  <Incidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/triage"
              element={
                <ProtectedRoute allowedRoles={['Safety Volunteer']}>
                  <Incidents />
                </ProtectedRoute>
              }
            />

            <Route
              path="/announcements"
              element={
                <ProtectedRoute allowedRoles={['Resident', 'Estate Administrator', 'Safety Volunteer']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/alerts"
              element={
                <ProtectedRoute allowedRoles={['Safety Volunteer']}>
                  <Announcements />
                </ProtectedRoute>
              }
            />

            <Route
              path="/events"
              element={
                <ProtectedRoute allowedRoles={['Resident', 'Estate Administrator', 'Safety Volunteer', 'Security Guard']}>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/events"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator']}>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/directory"
              element={
                <ProtectedRoute>
                  <Directory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator', 'Safety Volunteer']}>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/patrol"
              element={
                <ProtectedRoute allowedRoles={['Safety Volunteer']}>
                  <PatrolOps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moderation"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator']}>
                  <MemberModeration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/moderation"
              element={
                <ProtectedRoute allowedRoles={['Estate Administrator']}>
                  <MemberModeration />
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
        </AppShell>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
