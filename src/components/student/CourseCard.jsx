import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const CourseCard = ({ course }) => {
  const { currency } = useContext(AppContext);
  const discountedPrice = (
    course.coursePrice -
    (course.discount * course.coursePrice) / 100
  ).toFixed(2);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col w-full h-[250px]">
      <img
        src={course.courseThumbnail}
        alt={course.courseTitle}
        className="w-full h-[100px] object-cover"
      />
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-1">
          {course.courseTitle}
        </h3>
        <p className="text-xs text-gray-500 mb-1">{course.educator.name}</p>

        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1">
            <p className="text-yellow-500 font-medium">4.5</p>
            {[...Array(5)].map((_, i) => (
              <img
                key={i}
                src={assets.star}
                alt="star"
                className="w-3.5 h-3.5"
              />
            ))}
          </div>
          <p className="text-gray-400">(22)</p>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <p className="text-sm font-bold text-blue-600">
            {currency}
            {discountedPrice}
          </p>
          <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
