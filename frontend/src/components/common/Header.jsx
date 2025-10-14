import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
      <Link to={ROUTES.HOME} className="text-white text-2xl font-extrabold">Appointed</Link>
      <nav className="space-x-4">
        {user ? (
          <>
            <Link to={ROUTES.DASHBOARD} className="text-gray-300 hover:text-white">Dashboard</Link>
            <Link to={ROUTES.PROFILE} className="text-gray-300 hover:text-white">Profile</Link>
            <button
              onClick={logout}
              className="text-red-500 hover:text-red-600 font-semibold"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to={ROUTES.LOGIN} className="text-gray-300 hover:text-white">Login</Link>
            <Link to={ROUTES.REGISTER} className="text-gray-300 hover:text-white">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
