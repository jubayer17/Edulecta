import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);
  const rating = calculateRating(course); // ✅ store the rating
  const discountedPrice = (
    course.coursePrice -
    (course.discount * course.coursePrice) / 100
  ).toFixed(2);

  return (
    <Link
      to={"/course/" + course._id}
      onClick={() => scrollTo(0, 0)}
      className="border border-gray-100/30 pb-6 overflow-hidden rounded-lg"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
        <img
          src={course.courseThumbnail}
          alt={course.courseTitle}
          className="w-full"
        />
        <div className="p-3 flex flex-col flex-grow">
          <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
            {course.courseTitle}
          </h3>
          <p className="text-xs text-gray-500 mb-1">Jubayer Ahmed</p>

          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1">
              <p className="text-yellow-500 font-medium">{rating}</p>
              {[...Array(5)].map((_, i) => {
                const filled = rating >= i + 1;
                const half = rating >= i + 0.5;
                return (
                  <img
                    key={i}
                    src={
                      filled
                        ? assets.star
                        : half
                        ? assets.star
                        : assets.star_blank
                    }
                    alt="star"
                    className="w-3.5 h-3.5"
                  />
                );
              })}
            </div>
            <p className="text-gray-400">{course.courseRatings.length}</p>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <p className="text-sm font-bold text-blue-600">
              $ {discountedPrice}
            </p>
            <button className="bg-blue-600 text-white px-3 py-1 text-xs rounded hover:bg-blue-700">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
