import React from "react";
import { assets } from "../../assets/assets";

const CallToAction = () => {
  return (
    <div className="py-20 px-4 md:px-8 lg:px-20 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10 w-full mx-auto text-center">
        {/* Center Content */}
        <div className="max-w-4xl mx-auto relative z-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-purple-200/50">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            Start Your Learning Journey Today
          </div>

          {/* Main Heading */}
          <h2 className="text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 bg-clip-text text-transparent leading-tight mb-6">
            Learn anything, anytime,
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              anywhere in the world 🌍
            </span>
          </h2>

          {/* Description */}
          <p className="mt-2 text-sm md:text-base lg:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto font-light">
            Expand your skills at your own pace with
            <span className="text-purple-600 font-semibold">
              {" "}
              world-class expert-led content{" "}
            </span>
            and comprehensive hands-on practice. Empower your professional
            journey with
            <span className="text-pink-600 font-semibold">
              {" "}
              flexible, personalized learning{" "}
            </span>
            that fits your schedule and goals.
          </p>

          {/* Enhanced Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8 mb-8 text-gray-600">
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-purple-600">
                50,000+
              </div>
              <div className="text-xs mt-1">Active Students</div>
            </div>
            <div className="w-px h-10 bg-gray-300 hidden md:block"></div>
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-pink-600">
                500+
              </div>
              <div className="text-xs mt-1">Expert Courses</div>
            </div>
            <div className="w-px h-10 bg-gray-300 hidden md:block"></div>
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-indigo-600">
                4.9★
              </div>
              <div className="text-xs mt-1">Average Rating</div>
            </div>
            <div className="w-px h-10 bg-gray-300 hidden md:block"></div>
            <div className="text-center">
              <div className="text-lg md:text-xl font-bold text-green-600">
                95%
              </div>
              <div className="text-xs mt-1">Success Rate</div>
            </div>
          </div>
          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {/* Primary Button */}
            <button className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden min-w-[160px]">
              {/* Button background animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-base">🚀</span>
                <span>Start Learning Now</span>
                <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
              </div>
            </button>

            {/* Secondary Button */}
            <button className="group relative bg-white border-2 border-purple-200 text-purple-600 px-6 py-2.5 text-sm font-semibold rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 hover:scale-105 min-w-[160px]">
              <div className="flex items-center justify-center gap-2">
                <span>Explore Courses</span>
                <svg
                  className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </button>
          </div>

          {/* Enhanced Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3 text-gray-600 text-xs max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-1 p-2 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-purple-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-xs">7-Day Free Trial</span>
              <span className="text-xs text-center text-gray-500">
                No credit card required
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-purple-100">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-xs">Cancel Anytime</span>
              <span className="text-xs text-center text-gray-500">
                Flexible subscription
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 bg-white/80 backdrop-blur-sm rounded-md shadow-sm border border-purple-100">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="font-semibold text-xs">
                Certificates Included
              </span>
              <span className="text-xs text-center text-gray-500">
                Industry recognized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default CallToAction;
