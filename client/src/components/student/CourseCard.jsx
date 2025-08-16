import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiHeart } from "react-icons/fi";

const CourseCard = ({ course }) => {
  const { calculateRating, addToCart, cartItems, toggleCartDrawer } =
    useContext(AppContext);
  const rating = calculateRating(course);

  // Check if course is already in cart
  const isInCart = cartItems.some((item) => item._id === course._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(course);
    // Open cart drawer after adding item
    setTimeout(() => {
      toggleCartDrawer();
    }, 100);
  };

  // Calculate course duration in weeks
  const calculateDurationInWeeks = (course) => {
    if (!course || !Array.isArray(course.courseContent)) return "1 week";

    let totalMinutes = 0;
    course.courseContent.forEach((chapter) => {
      if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
        chapter.chapterContent.forEach((lecture) => {
          if (lecture.lectureDuration) {
            totalMinutes += lecture.lectureDuration;
          }
        });
      }
    });

    // Convert minutes to weeks with more realistic calculation
    const totalHours = totalMinutes / 60;

    // More realistic assumptions:
    // - 6-8 hours study per week for intensive courses
    // - Cap at maximum 12 weeks for any course
    const studyHoursPerWeek = 7; // More reasonable study time
    let weeks = Math.ceil(totalHours / studyHoursPerWeek);

    // Cap maximum weeks and set minimums
    if (weeks > 12) weeks = 12; // No course should show more than 12 weeks
    if (weeks < 1) weeks = 1; // Minimum 1 week

    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  };
  const courseDurationInWeeks = calculateDurationInWeeks(course);

  // Ensure we have valid numbers for price calculations
  const coursePrice = parseFloat(course.coursePrice) || 0;
  const courseOfferPrice = parseFloat(course.courseOfferPrice) || 0;
  const discount = parseFloat(course.discount) || 0;

  // Use courseOfferPrice if available and valid, otherwise calculate discounted price
  const offerPrice =
    courseOfferPrice > 0
      ? courseOfferPrice
      : coursePrice - (discount * coursePrice) / 100;

  const hasDiscount =
    (courseOfferPrice > 0 && courseOfferPrice < coursePrice) || discount > 0;

  return (
    <Link
      to={"/course/" + course._id}
      onClick={() => scrollTo(0, 0)}
      className="block h-full group"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100/20 group-hover:border-blue-200 transform hover:-translate-y-1">
        {/* Further reduced height image container */}
        <div className="relative h-28 sm:h-32 md:h-36 overflow-hidden bg-gray-100">
          <img
            src={course.courseThumbnail}
            alt={course.courseTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full shadow-lg animate-pulse">
              -{course.discount}% OFF
            </div>
          )}

          {/* Cart Icon Only - Enhanced with better animations */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <button
              onClick={handleAddToCart}
              className={`p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                isInCart
                  ? "bg-green-500 text-white animate-pulse"
                  : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
              title={isInCart ? "Already in cart" : "Add to cart"}
            >
              <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Play Button Overlay for Mobile */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center sm:hidden">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-4 h-4 text-blue-600 ml-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8 5v10l8-5-8-5z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content section with reduced padding */}
        <div className="p-2 sm:p-2.5 flex flex-col flex-grow">
          {/* Course title - single line with truncate */}
          <div className="mb-1 sm:mb-1.5">
            <h3 className="text-sm sm:text-base font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors duration-300">
              {course.courseTitle}
            </h3>
          </div>

          {/* Instructor name */}
          <p className="text-xs sm:text-sm text-gray-500 mb-1.5 font-medium truncate">
            by Jubayer Ahmed
          </p>

          {/* Rating and enrollment section */}
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
            <div className="flex items-center gap-1">
              <span className="text-yellow-600 font-semibold">{rating}</span>
              <div className="flex items-center gap-0.5">
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
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                  );
                })}
              </div>
            </div>
            <span className="text-gray-400 text-xs">
              ({course.courseRatings?.length || 0})
            </span>
          </div>

          {/* Enrolled students count and duration */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1.5">
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              <span className="truncate">
                {course.enrolledStudents?.length || 0} students
              </span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{courseDurationInWeeks}</span>
            </div>
          </div>

          {/* Price and button section - pushed to bottom */}
          <div className="mt-auto space-y-2">
            {/* Price section */}
            <div className="flex items-center gap-2">
              {/* Offer price on the left */}
              <span className="text-lg sm:text-xl font-bold text-blue-600">
                ${offerPrice.toFixed(2)}
              </span>
              {/* Original price crossed out on the right */}
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ${coursePrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Button section - Same height buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                  isInCart
                    ? "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500"
                }`}
              >
                <FiShoppingCart className="w-3 h-3 mr-1" />
                <span className="whitespace-nowrap text-xs">
                  {isInCart ? "Added" : "Add Cart"}
                </span>
              </button>

              <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-2 py-2 text-xs font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                <span className="whitespace-nowrap text-xs">Enroll Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
