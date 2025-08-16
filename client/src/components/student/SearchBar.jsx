import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiSearch, FiX, FiFilter, FiTrendingUp } from "react-icons/fi";

const SearchBar = () => {
  const navigate = useNavigate();
  const { input } = useParams();
  const [searchTerm, setSearchTerm] = useState(input || "");
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Popular search suggestions that update based on search term
  const getFilteredSuggestions = () => {
    const allSuggestions = [
      "React Development",
      "Python Programming",
      "Web Design",
      "Data Science",
      "Machine Learning",
      "JavaScript Fundamentals",
      "Node.js Backend",
      "React Native Mobile",
      "UI/UX Design",
      "Database Management",
    ];

    if (!searchTerm.trim()) {
      return allSuggestions.slice(0, 5); // Show first 5 when no search term
    }

    // Filter suggestions based on search term
    const filtered = allSuggestions.filter((suggestion) =>
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.length > 0 ? filtered : allSuggestions.slice(0, 3);
  };

  useEffect(() => {
    setSearchTerm(input || "");
  }, [input]);

  const onChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    // No automatic navigation - only update the search term
  };

  const onClear = () => {
    setSearchTerm("");
    navigate("/course-list");
    inputRef.current?.focus();
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsLoading(true);
      // Navigate to course list with search term
      navigate(`/course-list/${encodeURIComponent(searchTerm.trim())}`);
      setIsFocused(false);
      inputRef.current?.blur();
      // Reset loading state after navigation
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const onSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setIsLoading(true);
    // Navigate to course list with selected suggestion
    navigate(`/course-list/${encodeURIComponent(suggestion)}`);
    setIsFocused(false);
    inputRef.current?.blur();
    // Reset loading state after navigation
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Background matching Hero section */}
      <div className="absolute -inset-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl opacity-60"></div>

      {/* Search Form */}
      <form onSubmit={onSearch} className="relative z-10 px-2 sm:px-0">
        <div
          className={`relative transition-all duration-500 ease-out ${
            isFocused
              ? "transform scale-105 shadow-2xl"
              : "shadow-xl hover:shadow-2xl"
          }`}
        >
          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search for courses, topics, or skills..."
            className={`w-full bg-white/90 backdrop-blur-sm border-2 rounded-full px-4 sm:px-6 py-3 sm:py-4 pl-12 sm:pl-14 pr-14 sm:pr-16 
              text-gray-800 placeholder-gray-500 transition-all duration-500 ease-out text-sm sm:text-base
              focus:outline-none focus:border-blue-400 focus:bg-white/95 focus:shadow-inner
              ${
                isFocused
                  ? "border-blue-400 bg-white/95"
                  : "border-white/50 bg-white/80"
              }
              hover:border-blue-300 hover:bg-white/90`}
            style={{ borderRadius: "50px" }}
          />

          {/* Floating Search Icon */}
          <div
            className={`absolute inset-y-0 left-0 pl-3 sm:pl-5 flex items-center pointer-events-none transition-all duration-500 ${
              isFocused ? "animate-float-icon" : ""
            }`}
          >
            <FiSearch
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500 ${
                isFocused ? "text-blue-600 scale-110" : "text-gray-500"
              }`}
            />
          </div>

          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-10 sm:right-12 flex items-center px-2 text-gray-400 hover:text-red-500 transition-all duration-300 group rounded-full"
            >
              <FiX className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-125 group-hover:rotate-90 transition-all duration-300" />
            </button>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={!searchTerm.trim() || isLoading}
            className={`absolute inset-y-0 right-1 sm:right-2 top-1 sm:top-2 bottom-1 sm:bottom-2 flex items-center px-2 sm:px-3 
              rounded-full transition-all duration-500 ease-out
              ${
                searchTerm.trim() && !isLoading
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                  : "bg-gray-200/80 text-gray-400 cursor-not-allowed"
              }`}
            style={{ borderRadius: "50px" }}
          >
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSearch
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                  searchTerm.trim() ? "animate-pulse" : ""
                }`}
              />
            )}
          </button>
        </div>

        {/* Enhanced Loading Bar */}
        {isLoading && (
          <div className="absolute top-full left-0 w-full h-1 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-loading-bar" />
          </div>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      {isFocused && (
        <div className="absolute top-full left-0 w-full mt-4 bg-white/95 backdrop-blur-md border border-white/50 rounded-3xl shadow-2xl z-50 overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border-b border-gray-100/50">
            <div className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <FiTrendingUp className="w-4 h-4 text-blue-600 animate-bounce-slow" />
              {searchTerm.trim() ? "Related Courses" : "Popular Searches"}
            </div>
          </div>

          {/* Suggestions List */}
          <div className="py-3">
            {getFilteredSuggestions().map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left px-6 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 group flex items-center gap-4 transform hover:scale-102"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <FiSearch className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />
                <span className="text-gray-700 group-hover:text-blue-700 transition-all duration-300 font-medium">
                  {suggestion}
                </span>
                <FiTrendingUp className="w-3 h-3 text-gray-300 ml-auto group-hover:text-blue-500 transition-all duration-300 group-hover:animate-pulse" />
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50/80 to-blue-50/80 border-t border-gray-100/50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">
                Press Enter or click search button
              </span>
              <div className="flex items-center gap-2">
                <FiFilter className="w-3 h-3 text-gray-500 animate-pulse" />
                <span className="text-xs text-gray-600">Find courses</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Custom CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes floatIcon {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.1);
          }
        }
        @keyframes loadingBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes bounceSlow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }

        .animate-slide-in {
          animation: slideIn 0.4s ease-out forwards;
        }
        .animate-float-icon {
          animation: floatIcon 2s ease-in-out infinite;
        }
        .animate-loading-bar {
          animation: loadingBar 1.5s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default SearchBar;
