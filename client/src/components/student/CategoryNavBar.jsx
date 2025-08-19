import React, { useState, useEffect, useContext, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CategoryNavBar = ({ onCategorySelect, selectedCategory }) => {
  const { backendUrl } = useContext(AppContext);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const scrollContainerRef = useRef(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${backendUrl}/api/category`);
        const data = await response.json();

        if (data.success && data.categories) {
          setCategories(data.categories);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [backendUrl]);

  // Check scroll buttons visibility
  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Handle scroll
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? scrollContainerRef.current.scrollLeft - scrollAmount
          : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Initialize scroll buttons and add event listener
  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;

    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);

      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [categories]);

  if (loading) {
    return (
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className={`h-8 bg-gray-200 rounded-full animate-pulse ${
                  index === 0
                    ? "w-20"
                    : index === 1
                    ? "w-24"
                    : index === 2
                    ? "w-16"
                    : index === 3
                    ? "w-28"
                    : index === 4
                    ? "w-20"
                    : index === 5
                    ? "w-24"
                    : index === 6
                    ? "w-16"
                    : "w-20"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 py-2">
          <div className="text-center text-red-600 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-4 py-2 relative">
        <div className="flex items-center">
          {/* Left Scroll Button */}
          {showLeftScroll && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          )}

          {/* Categories Container */}
          <div
            ref={scrollContainerRef}
            className={`flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth ${
              showLeftScroll ? "pl-12" : ""
            } ${showRightScroll ? "pr-12" : ""}`}
          >
            {/* All Categories Button */}
            <button
              onClick={() => onCategorySelect(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
              }`}
            >
              All Categories
            </button>

            {/* Category Buttons */}
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onCategorySelect(category.name)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.name
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
                }`}
              >
                {category.name}
                {category.courseCount > 0 && (
                  <span className="ml-1 text-xs opacity-75 bg-white/20 px-1.5 py-0.5 rounded-full">
                    {category.courseCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Right Scroll Button */}
          {showRightScroll && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <FiChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Hide scrollbar with CSS */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategoryNavBar;
