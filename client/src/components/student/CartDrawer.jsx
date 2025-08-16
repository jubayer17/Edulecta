import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  FiX,
  FiShoppingBag,
  FiCreditCard,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiHeart,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const {
    cartItems,
    isCartDrawerOpen,
    toggleCartDrawer,
    removeFromCart,
    getCartTotal,
    clearCart,
  } = useContext(AppContext);

  const [isVisible, setIsVisible] = useState(false);
  const [removingItem, setRemovingItem] = useState(null);

  useEffect(() => {
    if (isCartDrawerOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartDrawerOpen]);

  const handleRemoveItem = async (courseId) => {
    setRemovingItem(courseId);
    setTimeout(() => {
      removeFromCart(courseId);
      setRemovingItem(null);
    }, 200);
  };

  const formatPrice = (course) => {
    const coursePrice = parseFloat(course.coursePrice) || 0;
    const courseOfferPrice = parseFloat(course.courseOfferPrice) || 0;
    const discount = parseFloat(course.discount) || 0;

    const finalPrice =
      courseOfferPrice > 0
        ? courseOfferPrice
        : coursePrice - (discount * coursePrice) / 100;

    return {
      finalPrice,
      originalPrice: coursePrice,
      hasDiscount:
        (courseOfferPrice > 0 && courseOfferPrice < coursePrice) ||
        discount > 0,
    };
  };

  return (
    <>
      {/* Overlay - Enhanced with better blur */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300 ${
          isCartDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCartDrawer}
      />

      {/* Drawer - Enhanced with better animations */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          isCartDrawerOpen ? "translate-x-0" : "translate-x-full"
        } ${isVisible ? "block" : "hidden"}`}
      >
        {/* Header - Enhanced with gradient and better spacing */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-700/90 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <FiShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Shopping Cart</h3>
                <p className="text-blue-100 text-sm">
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "course" : "courses"} selected
                </p>
              </div>
            </div>
            <button
              onClick={toggleCartDrawer}
              className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 group"
            >
              <FiX className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full pb-6">
          {cartItems.length === 0 ? (
            /* Empty Cart - Enhanced design with animations */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center animate-pulse">
                  <FiShoppingBag className="w-12 h-12 text-blue-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-500 font-bold text-sm">0</span>
                </div>
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">
                Your cart is empty
              </h4>
              <p className="text-gray-500 text-sm mb-8 max-w-sm leading-relaxed">
                Discover amazing courses, add them to your cart, and start your
                learning journey today!
              </p>
              <Link
                to="/course-list"
                onClick={toggleCartDrawer}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg transform hover:scale-105 flex items-center gap-3"
              >
                <FiShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Browse Courses
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items - Enhanced with better animations */}
              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {cartItems.map((course, index) => {
                  const { finalPrice, originalPrice, hasDiscount } =
                    formatPrice(course);
                  const isRemoving = removingItem === course._id;

                  return (
                    <div
                      key={course._id}
                      className={`bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 transform ${
                        isRemoving
                          ? "scale-95 opacity-50"
                          : "scale-100 opacity-100"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "slideInRight 0.3s ease-out forwards",
                      }}
                    >
                      <div className="flex gap-4">
                        {/* Course Image - Enhanced */}
                        <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm group">
                          <img
                            src={course.courseThumbnail}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        </div>

                        {/* Course Info - Enhanced */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm truncate mb-1 group-hover:text-blue-600 transition-colors">
                            {course.courseTitle}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                            <FiUsers className="w-3 h-3" />
                            by Jubayer Ahmed
                          </p>

                          {/* Course stats */}
                          <div className="flex items-center gap-3 mb-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {course.courseDuration || "10h 30m"}
                            </span>
                            <span className="flex items-center gap-1">
                              <FiUsers className="w-3 h-3" />
                              {course.enrolledStudents?.length || 0} students
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-600">
                                ${finalPrice.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through bg-gray-50 px-1 rounded">
                                  ${originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Add to Wishlist"
                              >
                                <FiHeart className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(course._id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                                title="Remove from Cart"
                              >
                                <FiTrash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Clear All Button */}
                {cartItems.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="w-full mt-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-all duration-200 text-sm font-medium"
                  >
                    Clear All Items ({cartItems.length})
                  </button>
                )}
              </div>

              {/* Footer - Enhanced design with better spacing */}
              <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-6 space-y-6">
                {/* Quick Stats */}
                <div className="flex justify-between items-center text-sm text-gray-600 bg-white p-3 rounded-xl">
                  <span>Total Courses</span>
                  <span className="font-semibold">{cartItems.length}</span>
                </div>

                {/* Total Section */}
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Tax calculated at checkout</span>
                    <span className="bg-green-50 text-green-600 px-2 py-1 rounded-full font-medium">
                      Free shipping
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/cart"
                    onClick={toggleCartDrawer}
                    className="w-full block text-center px-6 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
                  >
                    View Full Cart & Details
                  </Link>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 text-sm flex items-center justify-center gap-3 shadow-lg transform hover:scale-105 group">
                    <FiCreditCard className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Proceed to Checkout (${getCartTotal().toFixed(2)})
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CartDrawer;
