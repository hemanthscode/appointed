import React from 'react';
import Header from './Header';
import ErrorBoundary from './ErrorBoundary';

export const Layout = ({ children, headerTitle = '', showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      {showHeader && <Header />}
      {headerTitle && (
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <h1 className="text-2xl font-bold">{headerTitle}</h1>
        </header>
      )}
      <main className="flex-grow p-4">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <footer className="bg-gray-800 text-gray-400 text-center p-4">
        &copy; {new Date().getFullYear()} Appointed
      </footer>
    </div>
  );
};

export default Layout;
