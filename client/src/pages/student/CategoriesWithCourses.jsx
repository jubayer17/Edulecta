import React, { useState } from "react";
import CategoryNavBar from "../../components/student/CategoryNavBar";
import CategoryCourses from "../../components/student/CategoryCourses";

const CategoriesWithCourses = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Navigation Bar */}
      <CategoryNavBar 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      
      {/* Category Courses */}
      <CategoryCourses selectedCategory={selectedCategory} />
    </div>
  );
};

export default CategoriesWithCourses;
