import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const TestimonialsSection = () => {
  return (
    <div className="pb-20 px-4 md:px-8 lg:px-20 relative overflow-hidden">
      {/* Content */}
      <div className="relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 shadow-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            Success Stories
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-pink-700 bg-clip-text text-transparent mb-6">
            What Our Students Say
          </h2>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Hear from our learners as they share their journeys of
            transformation, success, and how our platform made a
            <span className="text-purple-600 font-semibold">
              {" "}
              real difference{" "}
            </span>
            in their lives.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>10,000+ Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>95% Success Rate</span>
            </div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative">
          {/* Decorative elements */}
          <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse"></div>
          <div
            className="absolute -bottom-6 -right-6 w-28 h-28 bg-gradient-to-br from-pink-200/20 to-indigo-200/20 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>

          {dummyTestimonial.map((value, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl p-8 flex flex-col h-full transition-all duration-500 hover:scale-[1.02] border border-white/50 hover:border-purple-200/50 transform opacity-0 animate-fade-in-up"
              style={{
                animationDelay: `${index * 200}ms`,
                animationFillMode: "forwards",
              }}
            >
              {/* Header with Avatar */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-purple-50/50 px-4 py-4 rounded-2xl mb-6 group-hover:from-purple-50 group-hover:to-pink-50 transition-all duration-300">
                <div className="relative">
                  <img
                    src={value.image}
                    alt={value.name}
                    className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                  />
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300">
                    {value.name}
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {value.role}
                  </p>
                </div>
              </div>

              {/* Rating Section */}
              <div className="mb-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => {
                    const filled = value.rating >= i + 1;
                    const half =
                      value.rating >= i + 0.5 && value.rating < i + 1;
                    const starWidth = filled ? "100%" : half ? "50%" : "0%";

                    return (
                      <div
                        key={i}
                        className="transform transition-all duration-300 hover:scale-125 relative w-5 h-5"
                        style={{ animationDelay: `${i * 100}ms` }}
                      >
                        {/* Background star (empty) */}
                        <img
                          src={assets.star_blank}
                          alt="star"
                          className="absolute inset-0 w-full h-full"
                        />
                        {/* Foreground star (filled or half) */}
                        {(filled || half) && (
                          <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: starWidth }}
                          >
                            <img
                              src={assets.star}
                              alt="star"
                              className="w-full h-full"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Quote */}
                <div className="relative">
                  <div className="absolute -top-2 -left-2 text-6xl text-purple-200 font-serif leading-none">
                    "
                  </div>
                  <p className="text-gray-700 leading-relaxed pl-6 italic group-hover:text-gray-800 transition-colors duration-300">
                    {value.feedback}
                  </p>
                  <div className="absolute -bottom-4 -right-2 text-6xl text-purple-200 font-serif leading-none rotate-180">
                    "
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto">
                <button className="group/btn inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm transition-all duration-300 hover:gap-3">
                  <span>Read Full Story</span>
                  <svg
                    className="w-4 h-4 transform transition-transform duration-300 group-hover/btn:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <span>Share Your Success Story</span>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default TestimonialsSection;
