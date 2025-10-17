import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';

const App = () => (
  <NotificationProvider>
    <AuthProvider>
      <SocketProvider>
        <Router>

            <AppRoutes />

        </Router>
      </SocketProvider>
    </AuthProvider>
  </NotificationProvider>
);

export default App;
