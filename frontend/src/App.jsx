import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, NotificationContext, SocketContext } from './contexts';
import { ErrorBoundary } from './components/common';
import { ROUTES } from './data/constants';

import {
  LandingPage,
  LoginPage,
  RegisterPage,
  NotFoundPage,
  Dashboard,
  TeachersPage,
  AppointmentPage,
  MessagesPage,
  AppointmentsPage,
  AdminPage,
  ProfilePage,
  SchedulePage,
  RequestsPage,
} from './pages';

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      {/* Pass an initial value or context setup as needed */}
      <NotificationContext.Provider value={{ /* your notification state and methods */ }}>
        <SocketContext.Provider value={{ /* socket instance or methods */ }}>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.HOME} element={<LandingPage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.TEACHERS} element={<TeachersPage />} />
              <Route path={`${ROUTES.APPOINTMENTS}/:teacherId`} element={<AppointmentPage />} />
              <Route path={ROUTES.MESSAGES} element={<MessagesPage />} />
              <Route path={ROUTES.APPOINTMENTS} element={<AppointmentsPage />} />
              <Route path={ROUTES.ADMIN} element={<AdminPage />} />
              <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
              <Route path={ROUTES.SCHEDULE} element={<SchedulePage />} />
              <Route path={ROUTES.REQUESTS} element={<RequestsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </SocketContext.Provider>
      </NotificationContext.Provider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
