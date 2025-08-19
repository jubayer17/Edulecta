import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CategoryNavBar from "./CategoryNavBar";
import CategoryCourses from "./CategoryCourses";

const CategoryNavWrapper = ({ children }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Show category nav on all student pages except educator/dashboard sections
  const showCategoryNav = !location.pathname.startsWith("/educator");

  // Show filtered courses on course listing pages when category is selected
  const showFilteredCourses =
    selectedCategory !== null && 
    (location.pathname === "/course-list" || 
     location.pathname === "/top-picks-courses" || 
     location.pathname === "/newly-added-courses" ||
     location.pathname.startsWith("/course-list/"));

  const handleCategorySelect = (category) => {
    if (location.pathname === "/" || 
        location.pathname === "/categories" || 
        location.pathname === "/browse-courses") {
      // On home page and category pages, navigate to course list with category filter
      if (category) {
        navigate(`/course-list?category=${encodeURIComponent(category)}`);
      } else {
        navigate("/course-list");
      }
    } else if (location.pathname === "/course-list" || 
               location.pathname === "/top-picks-courses" || 
               location.pathname === "/newly-added-courses" ||
               location.pathname.startsWith("/course-list/")) {
      // On course listing pages, filter courses directly
      setSelectedCategory(category);
    } else {
      // On other pages (wishlist, cart, etc.), just navigate to course list
      if (category) {
        navigate(`/course-list?category=${encodeURIComponent(category)}`);
      } else {
        navigate("/course-list");
      }
    }
  };

  if (!showCategoryNav) {
    return <div className="pt-16 md:pt-20">{children}</div>;
  }

  return (
    <>
      {/* Add top padding to account for fixed navbar */}
      <div className="pt-16 md:pt-20">
        {/* Category Navigation Bar */}
        <CategoryNavBar
          onCategorySelect={handleCategorySelect}
          selectedCategory={selectedCategory}
        />

        {/* Content Area */}
        <div
          className={`min-h-screen ${
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
