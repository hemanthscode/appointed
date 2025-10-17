import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const PendingApproval = () => (
  <div className="fixed inset-0 bg-black text-white flex flex-col justify-center items-center p-6 select-none">
    <Clock className="w-20 h-20 mb-6" />
    <h1 className="text-5xl font-extrabold mb-4 text-center">Your Account is Pending Approval</h1>
    <p className="text-lg mb-10 max-w-md text-center text-gray-300">
      Your registration request is under review by our administrators. You will receive an email notification once your account is approved.
    </p>
    <Link
      to="/"
      className="px-10 py-4 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-black transition-colors duration-200"
      aria-label="Back to Home"
    >
      Back to Home
    </Link>
  </div>
);

export default PendingApproval;
