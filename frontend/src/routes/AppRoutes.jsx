import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from '../components/layout/PrivateRoute';
import Loader from '../components/common/Loader';

// Lazy loaded pages
const Home = lazy(() => import('../pages/Home'));
const NotFound = lazy(() => import('../pages/NotFound'));
const LandingPage = lazy(() => import('../pages/LandingPage'));
const RegistrationSuccess = lazy(() => import('../pages/RegistrationSuccess'));
const PendingApproval = lazy(() => import('../pages/PendingApproval'));
const AccountInactive = lazy(() => import('../pages/AccountInactive'));


const Login = lazy(() => import('../pages/Auth/Login'));
const Register = lazy(() => import('../pages/Auth/Register'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/Auth/ResetPassword'));
const ChangePassword = lazy(() => import('../pages/Profile/ChangePassword'));


const AppointmentList = lazy(() => import('../pages/Appointments/AppointmentList'));
const AppointmentDetails = lazy(() => import('../pages/Appointments/AppointmentDetails'));
const NewAppointment = lazy(() => import('../pages/Appointments/NewAppointment'));

const Conversations = lazy(() => import('../pages/Messages/Conversations'));
const ChatWindow = lazy(() => import('../pages/Messages/ChatWindow'));

const Notifications = lazy(() => import('../pages/Notifications/NotificationList'));

const ProfileView = lazy(() => import('../pages/Profile/ProfileView'));
const ProfileEdit = lazy(() => import('../pages/Profile/ProfileEdit'));

const ScheduleView = lazy(() => import('../pages/Schedule/ScheduleView'));
const SlotManagement = lazy(() => import('../pages/Schedule/SlotManagement'));

const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/Admin/Users'));
const AdminApprovals = lazy(() => import('../pages/Admin/Approvals'));
const AdminSettings = lazy(() => import('../pages/Admin/Settings'));

const AppRoutes = () => (
  <Suspense fallback={<Loader className="mt-20 mx-auto" />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile/change-password" element={<ChangePassword />} />
      <Route path="/registration-success" element={<RegistrationSuccess />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/account-inactive" element={<AccountInactive />} />


      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointments/new" element={<NewAppointment />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />

        <Route path="/messages" element={<Conversations />} />
        <Route path="/messages/:conversationId" element={<ChatWindow />} />

        <Route path="/notifications" element={<Notifications />} />

        <Route path="/profile" element={<ProfileView />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />

        <Route path="/schedule" element={<ScheduleView />} />
        <Route path="/schedule/manage" element={<SlotManagement />} />
      </Route>

      {/* Admin routes */}
      <Route element={<PrivateRoute roles={['admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/approvals" element={<AdminApprovals />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
