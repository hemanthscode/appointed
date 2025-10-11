import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import {
  AdminPage,
  AppointmentPage,
  AppointmentsPage,
  ChangePasswordPage,
  Dashboard,
  ForgotPasswordPage,
  LandingPage,
  LoginPage,
  MessagesPage,
  NotFoundPage,
  ProfilePage,
  RegisterPage,
  RequestsPage,
  ResetPasswordPage,
  SchedulePage,
  StudentList,
  TeachersList,
  TeachersPage,
} from './pages';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-white p-6">Loading...</div>;

  return user ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected Routes */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <PrivateRoute>
                  <ChangePasswordPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/teachers"
              element={
                <PrivateRoute>
                  <TeachersList />
                </PrivateRoute>
              }
            />
            <Route
              path="/students"
              element={
                <PrivateRoute>
                  <StudentList />
                </PrivateRoute>
              }
            />
            <Route
              path="/appointments"
              element={
                <PrivateRoute>
                  <AppointmentsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/appointment/create"
              element={
                <PrivateRoute>
                  <AppointmentPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <PrivateRoute>
                  <RequestsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <MessagesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <PrivateRoute>
                  <SchedulePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <AdminPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/teachers-page"
              element={
                <PrivateRoute>
                  <TeachersPage />
                </PrivateRoute>
              }
            />

            {/* Catch all - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
