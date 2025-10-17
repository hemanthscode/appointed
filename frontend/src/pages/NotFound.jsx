import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="max-w-md mx-auto p-4 text-center text-black">
    <h1 className="text-5xl font-bold mb-4">404</h1>
    <p className="mb-6">Page not found.</p>
    <Link to="/" className="underline hover:no-underline text-black">
      Go back home
    </Link>
  </main>
);

export default NotFound;
