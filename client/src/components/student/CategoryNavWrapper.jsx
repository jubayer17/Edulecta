import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryNavBar from "./CategoryNavBar";
import CategoryCourses from "./CategoryCourses";

const CategoryNavWrapper = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Show category nav on specific pages but handle each differently
  // Exclude educator routes from showing category nav
  const showCategoryNav =
    !location.pathname.startsWith("/educator") &&
    ([
      "/",
      "/course-list",
      "/top-picks-courses",
      "/newly-added-courses",
    ].includes(location.pathname) ||
      location.pathname.startsWith("/course-list/"));

  // Show filtered courses on non-home pages when category is selected
  const showFilteredCourses =
    selectedCategory !== null && location.pathname !== "/";

  const handleCategorySelect = (category) => {
    if (location.pathname === "/") {
      // On home page, navigate to course list with category filter
      if (category) {
        navigate(`/course-list?category=${encodeURIComponent(category)}`);
      } else {
        navigate("/course-list");
      }
    } else {
      // On other pages, filter courses directly
      setSelectedCategory(category);
    }
  };

  if (!showCategoryNav) {
    return <div className="pt-16 md:pt-20">{children}</div>;
  }

  return (
    <>
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-16 md:pt-20">
        {/* Fixed Category Navigation Bar - Sticks below main navbar */}
        <div className="fixed top-12 md:top-16 left-0 right-0 z-40 border-t border-gray-200">
          <CategoryNavBar
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />
        </div>

        {/* Content Area with additional padding for category navbar */}
        <div
          className={`pt-12 min-h-screen ${
            location.pathname === "/" ? "" : "bg-gray-50"
          }`}
        >
          {/* Show filtered courses only on course list pages, not home */}
          {showFilteredCourses ? (
            <CategoryCourses selectedCategory={selectedCategory} />
          ) : (
            children
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryNavWrapper;
