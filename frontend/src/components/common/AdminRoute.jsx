import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({ user }) => {
  if (!user || user.role !== 'admin') {
    return <Navigate to='/' />;
  }

  return <Outlet />;
};

export default AdminRoute;
