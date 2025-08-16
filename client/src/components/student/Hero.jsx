import React from "react";
import { assets } from "./../../assets/assets";
import {
  FiPlay,
  FiArrowRight,
  FiStar,
  FiUsers,
  FiBookOpen,
} from "react-icons/fi";

const Hero = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center w-full pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient Overlay - Fades from unified background to white */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.9) 70%, white 100%)",
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-6 md:space-y-8 max-w-6xl mx-auto">
        {/* Stats Badge - Mobile Optimized & Centered */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-full shadow-lg border border-white/20 w-full max-w-sm sm:max-w-fit mx-auto">
          {/* Mobile: Stack vertically, Desktop: Horizontal */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiUsers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              50k+ Students
            </span>
          </div>

          {/* Vertical divider - hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FiBookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              1000+ Courses
            </span>
          </div>

          {/* Vertical divider - hidden on mobile */}
          <div className="hidden sm:block w-px h-6 bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-current"
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
              4.9 Rating
            </span>
          </div>
        </div>

        {/* Main Heading */}
        <div className="space-y-4 sm:space-y-6">
          <h1 className="relative font-bold text-gray-800 max-w-4xl mx-auto text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl leading-tight animate-fade-in-up px-2">
            <span className="inline-block animate-slide-in-left">
              Empower your future with
            </span>{" "}
            <span className="relative inline-block mx-1 sm:mx-2 animate-slide-in-right">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-text">
                courses
              </span>
              <img
                className="hidden md:block absolute -bottom-2 md:-bottom-3 -right-4 md:-right-6 w-10 md:w-16 h-auto animate-bounce-slow"
                src={assets.sktech}
                alt=""
              />
            </span>
            <span className="inline-block animate-slide-in-left delay-300">
              that fit your choice
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="space-y-3 sm:space-y-4 animate-fade-in-up delay-500 px-2">
          <p className="hidden md:block text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Join thousands of professionals advancing their careers with
            expert-led courses, hands-on projects, and industry-recognized
            certifications. Transform your skills today.
          </p>
          <p className="md:hidden text-gray-600 max-w-sm mx-auto text-sm leading-relaxed">
            Expert-led courses with hands-on projects and industry
            certifications to advance your career.
          </p>
        </div>

        {/* Key Features */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6 animate-fade-in-up delay-600 px-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Lifetime Access
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Expert Instructors
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/60 backdrop-blur-sm px-2 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-purple-100 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Certificates
            </span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-2 sm:pt-4 animate-fade-in-up delay-700 px-2">
          <button className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 sm:gap-3 text-sm sm:text-base w-full sm:w-auto justify-center">
            Get Started Now
            <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>

          <button className="group bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 sm:gap-3 border border-gray-200/50 text-sm sm:text-base w-full sm:w-auto justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <FiPlay className="w-3 h-3 sm:w-4 sm:h-4 text-white ml-0.5" />
            </div>
            Watch Demo
          </button>
        </div>
      </div>

      {/* Floating Elements - Hidden on mobile for better performance */}
      <div className="absolute top-1/4 left-8 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 animate-float">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">New Course!</p>
              <p className="text-sm text-gray-600">React Development</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/3 right-8 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 animate-float-delayed">
          <div className="flex items-center gap-3">
            <img
              src={assets.profile_img_1}
              alt="Student"
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="font-semibold text-gray-800">Sarah M.</p>
              <p className="text-sm text-gray-600">Completed 12 courses</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Element 3 - Bottom Left */}
      <div className="absolute bottom-32 left-12 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 animate-float-slow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <FiStar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">4.9/5 Rating</p>
              <p className="text-sm text-gray-600">50k+ Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Element 4 - Bottom Right */}
      <div className="absolute bottom-28 right-16 hidden lg:block">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-white/20 animate-float-reverse">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Live Community</p>
              <p className="text-sm text-gray-600">24/7 Support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
