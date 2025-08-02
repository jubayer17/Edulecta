import React from "react";
import { assets } from "../../assets/assets";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiBookOpen,
  FiUsers,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img
                src={assets.edulecta}
                alt="Edulecta Logo"
                className="w-32 sm:w-36"
              />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              Discover endless learning opportunities with our comprehensive
              courses designed by industry experts to help you achieve your
              goals.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <FiGlobe className="w-5 h-5" />
              <span className="text-sm">Student Learning Platform</span>
            </div>
          </div>

          {/* Learning Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Learning Journey
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Available Courses</p>
                  <p className="text-sm font-medium text-white">
                    500+ Expert Courses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Active Students</p>
                  <p className="text-sm font-medium text-white">
                    50,000+ Learners
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Success Rate</p>
                  <p className="text-sm font-medium text-white">
                    95% Completion
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Access
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Browse Courses
                </a>
              </li>
              <li>
                <a
                  href="/course-list"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  All Courses
                </a>
              </li>
              <li>
                <a
                  href="/my-enrollments"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  My Enrollments
                </a>
              </li>
              <li>
                <a
                  href="/educator"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Become Educator
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-gray-300">
                <FiMail className="w-4 h-4 mt-0.5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">Email Support</p>
                  <a
                    href="mailto:support@edulecta.com"
                    className="text-sm hover:text-white transition-colors"
                  >
                    support@edulecta.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <FiPhone className="w-4 h-4 mt-0.5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone Support</p>
                  <a
                    href="tel:+1234567890"
                    className="text-sm hover:text-white transition-colors"
                  >
                    +1 (234) 567-8900
                  </a>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="/help"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <FiAward className="w-4 h-4" />
                  Help Center
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Border & Copyright */}
        <div className="border-t border-slate-700/50 mt-10 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400">
                © 2025 Edulecta Learning Platform. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Empowering learners worldwide with exceptional educational
                experiences.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <a
                href="/privacy"
                className="hover:text-gray-300 transition-colors"
              >
                Privacy Policy
              </a>
              <span>•</span>
              <a
                href="/terms"
                className="hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </a>
              <span>•</span>
              <a
                href="/accessibility"
                className="hover:text-gray-300 transition-colors"
              >
                Accessibility
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
