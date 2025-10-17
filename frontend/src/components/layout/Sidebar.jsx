import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  const items = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/appointments', label: 'Appointments' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/messages', label: 'Messages' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ];

  if (user?.role === 'admin') {
    items.push({ to: '/admin', label: 'Admin Panel' });
  }

  return (
    <aside
      className="border-r border-black p-4 w-64 bg-white text-black min-h-screen"
      aria-label="Sidebar navigation"
    >
      <nav className="flex flex-col space-y-4" role="navigation">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-black ${
                isActive ? 'bg-black text-white' : 'hover:bg-black hover:text-white'
              } transition`
            }
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default React.memo(Sidebar);
