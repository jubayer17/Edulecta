import React, { useEffect, useState } from "react";

const Rating = ({
  initialRating = 0,
  onRate,
  size = "base",
  readOnly = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleRating = (value) => {
    if (readOnly) return;

    setRating(value);
    if (onRate) {
      onRate(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-xl lg:text-2xl";
      default:
        return "text-base lg:text-lg";
    }
  };
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const isActive = starValue <= (hoverRating || rating);

        return (
          <span
            key={index}
            className={`${isActive ? "text-yellow-400" : "text-gray-300"} ${
              readOnly ? "" : "hover:text-yellow-300 cursor-pointer"
            } transition-colors duration-200 ${getSizeClass()} select-none`}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            role={readOnly ? "img" : "button"}
            aria-label={`${starValue} star${starValue !== 1 ? "s" : ""}`}
          >
            ★
          </span>
        );
      })}
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : "Rate this"}
        </span>
      )}
    </div>
  );
};

export default Rating;
