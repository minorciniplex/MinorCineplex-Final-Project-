import React, { useState } from 'react';
import axios from 'axios';
import Link from "next/link";
import NavbarLoading from '@/components/Navbar/NavbarLoading';




const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false); // เพิ่ม state นี้

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validate email
    if (!email) {
      setError('Please enter your email');
      setIsLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Invalid email format');
      setIsLoading(false);
      return;
    }

    try {
      // API call with axios
      const response = await axios.post('/api/auth/forgot-password', {
        email: email
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setMessage('Password reset link has been sent to your email');
      setEmail('');
      setIsEmailSent(true); // เพิ่มบรรทัดนี้
      
    } catch (err) {
      if (err.response) {
        // Server responded with error status
        setError(err.response.data.message || 'An error occurred. Please try again');
      } else if (err.request) {
        // Network error
        setError('Connection error. Please try again');
      } else {
        setError('An unexpected error occurred');
      }
    }

    setIsLoading(false);
  };

  return (
    <>
      <NavbarLoading />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-[#070C1B] backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-600/30">
        
          {/* Header - แสดงเฉพาะเมื่อยังไม่ได้ส่งอีเมลล์ */}
          {!isEmailSent && (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Forgot Password
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>

              {/* Success Message */}
              {message && (
                <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6 text-center text-sm">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {message}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-center text-sm">
                  <svg className="w-4 h-4 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </>
          )}

          {/* Form - แสดงเฉพาะเมื่อยังไม่ได้ส่งอีเมลล์ */}
          {!isEmailSent && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="block w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-white placeholder-slate-400"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#4E7BEE] hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {/* Success State - แสดงเมื่อส่งอีเมลล์สำเร็จแล้ว */}
          {isEmailSent && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Email Sent!</h3>
                <p className="text-slate-300 text-sm mb-4">
                  We've sent a password reset link to your email address. 
                  Please check your inbox and follow the instructions.
                </p>
                <button
                  onClick={() => {
                    setIsEmailSent(false);
                    setMessage('');
                    setError('');
                  }}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition duration-200"
                >
                  Send another email?
                </button>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link 
              href="/auth/login" 
              className="text-slate-400 hover:text-white text-sm transition duration-200 underline"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;