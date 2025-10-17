import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, Mail, Shield } from 'lucide-react';

const RegistrationSuccess = () => {
  const location = useLocation();
  const userName = location.state?.userName || 'User';
  const userEmail = location.state?.userEmail || '';

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col justify-center items-center p-6">
      {/* Icon and Title */}
      <div className="flex flex-col items-center mb-10 select-none">
        <CheckCircle className="w-20 h-20 text-white mb-6" strokeWidth={2} />
        <h1 className="text-5xl font-extrabold mb-2">Registration Successful!</h1>
        <p className="text-xl text-gray-300">Welcome aboard, {userName}!</p>
      </div>

      {/* Main Info Sections */}
      <div className="flex flex-col md:flex-row max-w-5xl w-full gap-16">
        {/* Left Column - Status and Steps */}
        <section className="flex-1 space-y-12">

          {/* Account Status */}
          <section className="bg-transparent border-l-4 border-white pl-6">
            <Clock className="w-10 h-10 mb-4 text-white" />
            <h2 className="text-2xl font-semibold mb-2">Account Under Review</h2>
            <p className="text-gray-300 leading-relaxed max-w-md">
              Your registration is currently <span className="font-semibold">pending verification</span>. An administrator will review your account details and approve your access shortly.
            </p>
          </section>

          {/* What Happens Next */}
          <section>
            <h2 className="flex items-center gap-3 text-2xl font-semibold mb-6">
              <Shield className="w-7 h-7 text-white" />
              What happens next?
            </h2>
            <ol className="list-decimal list-inside space-y-4 text-gray-300 max-w-md">
              <li>Our admin team will review your registration details.</li>
              <li>You'll receive an email notification once your account is approved.</li>
              <li>Once approved, you can log in and access all features.</li>
            </ol>
          </section>
        </section>

        {/* Right Column - Email and Actions */}
        <section className="flex-1 flex flex-col justify-between max-w-md text-gray-300">

          {/* Email Notification */}
          {userEmail && (
            <div className="flex items-center gap-3 bg-transparent border border-white rounded-lg p-4 mb-10">
              <Mail className="w-6 h-6 text-white flex-shrink-0" />
              <p>
                We've sent a confirmation email to{' '}
                <span className="font-semibold text-white">{userEmail}</span>.
                Please check your inbox.
              </p>
            </div>
          )}

          {/* Verification Time */}
          <div className="text-center mb-10">
            <p className="text-gray-400 text-sm font-mono">
              ⏱️ Verification typically takes <span className="font-semibold text-white">24-48 hours</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-6">
            <Link
              to="/login"
              className="block bg-white text-black py-4 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors duration-200 shadow-lg select-none"
              aria-label="Go to login page"
            >
              Go to Login
            </Link>
            <Link
              to="/"
              className="block border-2 border-white rounded-lg py-4 text-center font-semibold hover:bg-white hover:text-black transition-colors duration-200 select-none"
              aria-label="Back to home page"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Section */}
          <div className="mt-16 text-center text-gray-500 text-sm select-none">
            Need help?{' '}
            <a href="mailto:support@yourapp.com" className="text-white hover:underline font-medium">
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
