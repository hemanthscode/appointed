import React from 'react';
import Header from './Header';

const Layout = ({
  children,
  headerTitle,
  headerBackTo,
  headerActions,
  showHeader = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {showHeader && (
        <Header
          title={headerTitle}
          backTo={headerBackTo}
          actions={headerActions}
        />
      )}

      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
