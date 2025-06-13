import React, { useState } from "react";
import Head from "next/head";

// Error Popup Component (เหมือนกับที่ใช้ใน FrameByCinema)
function ErrorPopup({ isOpen, onClose, title, message }) {
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-red-600 text-white rounded-lg shadow-lg border border-red-700">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">{title}</h3>
            <p className="text-sm text-red-100">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 text-red-200 hover:text-white focus:outline-none"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TestErrorPopup() {
  const [errorPopup, setErrorPopup] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const showErrorPopup = (title, message) => {
    setErrorPopup({
      isOpen: true,
      title,
      message,
    });
  };

  const closeErrorPopup = () => {
    setErrorPopup({
      isOpen: false,
      title: "",
      message: "",
    });
  };

  const testScenarios = [
    {
      id: "movies-error",
      title: "Test Movies API Error",
      errorTitle: "Unable to Load Movies",
      errorMessage: "Something went wrong while retrieving movies. Please refresh or try again later.",
      buttonColor: "bg-red-500 hover:bg-red-600",
    },
    {
      id: "cinemas-error", 
      title: "Test Cinemas API Error",
      errorTitle: "Unable to Load Cinemas",
      errorMessage: "Something went wrong while retrieving cinemas. Please refresh or try again later.",
      buttonColor: "bg-orange-500 hover:bg-orange-600",
    },
    {
      id: "coupons-error",
      title: "Test Coupons API Error", 
      errorTitle: "Unable to Load Coupons",
      errorMessage: "Something went wrong while retrieving coupons. Please refresh or try again later.",
      buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      id: "nearby-cinemas-error",
      title: "Test Nearby Cinemas Error",
      errorTitle: "Unable to Load Nearby Cinemas", 
      errorMessage: "Something went wrong while retrieving nearby cinemas. Please refresh or try again later.",
      buttonColor: "bg-green-500 hover:bg-green-600",
    },
    {
      id: "location-denied",
      title: "Test Location Access Denied",
      errorTitle: "Location Access Denied",
      errorMessage: "Unable to access your location. Please enable location services or manually browse cinemas by city.",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      id: "location-not-supported",
      title: "Test Location Not Supported",
      errorTitle: "Location Not Supported", 
      errorMessage: "Your browser does not support location requests. Please manually browse cinemas by city.",
      buttonColor: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <>
      <Head>
        <title>Test Error Popup - Minor Cineplex</title>
        <meta name="description" content="Test page for error popup functionality" />
      </Head>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-white">Error Popup Test Page</h1>
            <p className="text-gray-300 mt-2">
              Test all error popup scenarios by clicking the buttons below
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Instructions */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">📋 Instructions</h2>
            <div className="space-y-2 text-gray-300">
              <p>• Click any button below to test the corresponding error popup</p>
              <p>• Each popup will appear at the bottom-right corner</p>  
              <p>• Popups auto-close after 5 seconds or click the X button</p>
              <p>• You can test multiple popups by clicking buttons quickly</p>
            </div>
          </div>

          {/* Test Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3 text-white">
                  {scenario.title}
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    <p><strong>Title:</strong> {scenario.errorTitle}</p>
                    <p><strong>Message:</strong> {scenario.errorMessage}</p>
                  </div>
                  <button
                    onClick={() => showErrorPopup(scenario.errorTitle, scenario.errorMessage)}
                    className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors ${scenario.buttonColor}`}
                  >
                    Test This Error
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Test All */}
          <div className="mt-12 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-400">🚀 Quick Test</h2>
            <p className="text-gray-300 mb-4">
              Test all error popups with random delays (useful for testing multiple popups)
            </p>
            <button
              onClick={() => {
                testScenarios.forEach((scenario, index) => {
                  setTimeout(() => {
                    showErrorPopup(scenario.errorTitle, scenario.errorMessage);
                  }, index * 1000); // 1 second delay between each popup
                });
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Test All Errors (Sequential)
            </button>
          </div>

          {/* Current Popup Status */}
          <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">📊 Current Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Popup Open:</span>{" "}
                <span className={errorPopup.isOpen ? "text-green-400" : "text-red-400"}>
                  {errorPopup.isOpen ? "Yes" : "No"}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Current Title:</span>{" "}
                <span className="text-white">{errorPopup.title || "None"}</span>
              </div>
            </div>
            {errorPopup.isOpen && (
              <div className="mt-3 p-3 bg-gray-700 rounded text-sm">
                <p className="text-gray-300">{errorPopup.message}</p>
              </div>
            )}
          </div>

          {/* Navigation Back */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>

      {/* Error Popup */}
      <ErrorPopup
        isOpen={errorPopup.isOpen}
        onClose={closeErrorPopup}
        title={errorPopup.title}
        message={errorPopup.message}
      />
    </>
  );
} 