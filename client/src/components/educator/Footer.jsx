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
              Empowering educators with cutting-edge tools to create, manage,
              and deliver exceptional learning experiences.
            </p>
            <div className="flex items-center gap-4 text-gray-400">
              <FiGlobe className="w-5 h-5" />
              <span className="text-sm">Educator Dashboard</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Your Impact
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Courses</p>
                  <p className="text-sm font-medium text-white">
                    Create & Manage
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center">
                  <FiUsers className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Students Reached</p>
                  <p className="text-sm font-medium text-white">
                    Track Progress
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Growth Analytics</p>
                  <p className="text-sm font-medium text-white">
                    Monitor Success
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
                  href="/educator"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Dashboard Overview
                </a>
              </li>
              <li>
                <a
                  href="/educator/my-courses"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  My Courses
                </a>
              </li>
              <li>
                <a
                  href="/educator/add-course"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Create New Course
                </a>
              </li>
              <li>
                <a
                  href="/educator/students-enrolled"
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  Student Analytics
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
                    href="mailto:educator@edulecta.com"
                    className="text-sm hover:text-white transition-colors"
                  >
                    educator@edulecta.com
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
                © 2025 Edulecta Educator Platform. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Empowering educators worldwide with innovative learning
                solutions.
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
