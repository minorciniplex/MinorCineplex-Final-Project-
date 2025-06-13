import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Link from "next/link";
import NavbarLoading from "@/components/Navbar/NavbarLoading";

const ResetPassword = () => {
  const router = useRouter();
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isResetSuccessful, setIsResetSuccessful] = useState(false);

  useEffect(() => {
    // Check if we have the necessary parameters for password reset
    const { code, email } = router.query;

    if (router.isReady) {
      if (!code) {
        setIsValidToken(false);
        setError(
          "Invalid or expired reset link. Please request a new password reset."
        );
      }
    }
  }, [router.isReady, router.query]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validatePasswords = () => {
    const errors = {};

    if (!passwords.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwords.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwords.newPassword)) {
      errors.newPassword =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!passwords.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validatePasswords();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const { code, email } = router.query;

      const response = await axios.post(
        "/api/auth/reset-password-anon",
        {
          code,
          email,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        },
      );

      if (response.status === 200) {
        setMessage(
          "Password has been reset successfully! You can now login with your new password."
        );
        setPasswords({
          newPassword: "",
          confirmPassword: "",
        });
        setIsResetSuccessful(true); // เพิ่มบรรทัดนี้

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/login");
        }, 4000);
      }
    } catch (err) {
      if (err.response) {
        // ดึง error message จาก response.data.error
        const errorMessage = err.response.data?.error || 
                            err.response.data?.message || 
                            "An error occurred while resetting your password";
        
        setError(errorMessage);
      } else if (err.request) {
        setError("Connection error. Please check your internet connection and try again");
      } else {
        setError("An unexpected error occurred. Please try again");
      }
      
      // Return early เพื่อป้องกัน error propagation
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === "new") {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  if (!isValidToken) {
    return (
      <>
        <NavbarLoading />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-600/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Invalid Reset Link
              </h2>
              <p className="text-slate-300 text-sm mb-6">
                This password reset link is invalid or has expired. Please
                request a new password reset.
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02]"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarLoading />
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-600/30">
          {/* Header - ซ่อนเมื่อ reset สำเร็จ */}
          {!isResetSuccessful && (
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Reset Your Password
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Enter your new password below to complete the reset process
              </p>
            </div>
          )}

          {/* Success Message - ซ่อนเมื่อ reset สำเร็จ */}
          {message && !isResetSuccessful && (
            <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg mb-6 text-center text-sm">
              <svg
                className="w-4 h-4 inline mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg mb-6 text-center text-sm">
              <svg
                className="w-4 h-4 inline mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          {!isResetSuccessful && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                    className={`block w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-white placeholder-slate-400 ${
                      validationErrors.newPassword
                        ? "border-red-500"
                        : "border-slate-600"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition duration-200"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                    className={`block w-full px-4 py-3 pr-12 bg-slate-700/50 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-white placeholder-slate-400 ${
                      validationErrors.confirmPassword
                        ? "border-red-500"
                        : "border-slate-600"
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition duration-200"
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">
                  Password Requirements:
                </h4>
                <ul className="text-xs text-slate-400 space-y-1">
                  <li
                    className={`flex items-center ${
                      passwords.newPassword.length >= 6 ? "text-green-400" : ""
                    }`}
                  >
                    <span className="mr-2">
                      {passwords.newPassword.length >= 6 ? "✓" : "•"}
                    </span>
                    At least 6 characters
                  </li>
                  <li
                    className={`flex items-center ${
                      /(?=.*[a-z])/.test(passwords.newPassword)
                        ? "text-green-400"
                        : ""
                    }`}
                  >
                    <span className="mr-2">
                      {/(?=.*[a-z])/.test(passwords.newPassword) ? "✓" : "•"}
                    </span>
                    At least one lowercase letter
                  </li>
                  <li
                    className={`flex items-center ${
                      /(?=.*[A-Z])/.test(passwords.newPassword)
                        ? "text-green-400"
                        : ""
                    }`}
                  >
                    <span className="mr-2">
                      {/(?=.*[A-Z])/.test(passwords.newPassword) ? "✓" : "•"}
                    </span>
                    At least one uppercase letter
                  </li>
                  <li
                    className={`flex items-center ${
                      /(?=.*\d)/.test(passwords.newPassword)
                        ? "text-green-400"
                        : ""
                    }`}
                  >
                    <span className="mr-2">
                      {/(?=.*\d)/.test(passwords.newPassword) ? "✓" : "•"}
                    </span>
                    At least one number
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={
                  isLoading ||
                  !passwords.newPassword ||
                  !passwords.confirmPassword
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Resetting Password...
                  </div>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          )}

          {/* แสดงเมื่อ reset สำเร็จ */}
          {isResetSuccessful && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-500 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">
                Password Reset Complete!
              </h3>
              <p className="text-slate-300">
                You will be redirected to the login page shortly...
              </p>
              <button
                onClick={() => router.push("/auth/login")}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium transition duration-200"
              >
                Go to Login Now
              </button>
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

export default ResetPassword;
