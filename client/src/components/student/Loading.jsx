import React from "react";

const Loading = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        {/* Main Loading Animation */}
        <div className="relative mb-8">
          {/* Outer rotating ring */}
          <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin">
            <div className="w-full h-full border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          {/* Inner pulsing dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse"></div>
          </div>

          {/* Floating particles */}
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-300"></div>
          <div className="absolute -bottom-2 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-500"></div>
          <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-700"></div>
        </div>

        {/* Loading Text with Typing Animation */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
            Edulecta
          </h2>
          <div className="flex items-center justify-center space-x-1">
            <span className="text-lg text-gray-600">Loading</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce delay-300"></div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto mb-4">
          <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-loading-bar"></div>
        </div>

        {/* Loading Messages */}
        <div className="text-sm text-gray-500 animate-pulse">
          <p>Preparing your learning experience...</p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1500"></div>
        <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-blue-300 rounded-full opacity-10 animate-bounce delay-2000"></div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-float delay-3000"></div>
      </div>

      {/* Custom CSS for additional animations */}
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            width: 0%;
            opacity: 1;
          }
          50% {
            width: 70%;
            opacity: 0.8;
          }
          100% {
            width: 100%;
            opacity: 0.6;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;
