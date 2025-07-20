import React, { useContext } from "react";
import { Link } from "react-router-dom";

import CourseCard from "./CourseCard";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const CoursesSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className=" flex flex-col items-center py-16 px-4 lg:px-20 w-full ">
      <h2 className="text-3xl font-semibold text-gray-800 text-center">
        Learn from the best
      </h2>
      <p className="text-center text-sm md:text-base text-gray-500 mt-3 max-w-2xl">
        Discover our top-rated courses across various categories. From coding
        and design to business and wellness, our courses are crafted to deliver
        results.
      </p>

      {/* Grid for 4 cards */}
      <div className="md:w-[1100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 w-full max-w-[2200px]">
        {allCourses.slice(0, 4).map((course, index) => (
          <CourseCard key={index} course={course} assets={assets} />
        ))}
      </div>

      <Link
        to="/course-list"
        onClick={() => window.scrollTo(0, 0)}
        className="text-gray-600 border border-gray-400 px-8 py-3 rounded mt-8 hover:bg-gray-100 transition"
      >
        Show all courses
      </Link>
    </div>
  );
};

export default CoursesSection;
