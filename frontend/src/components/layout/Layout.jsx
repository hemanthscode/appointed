import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';
import Loader from '../common/Loader';

const Layout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader className="mx-auto mt-20" />;

  // Paths to hide global Header & Sidebar because they have their own navbars
  const noLayoutPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ];

  const showLayout = user && !noLayoutPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-white text-black">
      {showLayout && <Header />}
      <div className="flex flex-1 min-h-0">
        {showLayout && <Sidebar />}
        <main
          className={`flex-grow p-6 overflow-auto min-h-0 ${
            showLayout ? 'border-l border-black' : ''
          }`}
        >
          {children}
        </main>
      </div>
      <Footer />
      <Toast />
    </div>
  );
};

export default Layout;
