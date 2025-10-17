import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-black p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <Link to="/" className="text-black font-bold text-xl select-none" aria-label="Appointed Homepage">
        Appointed
      </Link>
      <nav className="space-x-6" aria-label="Primary navigation">
        {user ? (
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-black hover:underline focus:outline-none focus:underline ${
                  isActive ? 'underline font-semibold' : ''
                }`
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              Dashboard
            </NavLink>
            {user.role === 'admin' && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `text-black hover:underline focus:outline-none focus:underline ${
                    isActive ? 'underline font-semibold' : ''
                  }`
                }
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              >
                Admin
              </NavLink>
            )}
            <Button onClick={logout} ariaLabel="Logout" className="ml-4">
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `text-black hover:underline focus:outline-none focus:underline ${
                  isActive ? 'underline font-semibold' : ''
                }`
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `text-black hover:underline focus:outline-none focus:underline ${
                  isActive ? 'underline font-semibold' : ''
                }`
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              Register
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default React.memo(Header);
