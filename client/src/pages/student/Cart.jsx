import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  FiTrash2,
  FiShoppingBag,
  FiCreditCard,
  FiArrowLeft,
  FiHeart,
  FiClock,
  FiUsers,
  FiStar,
  FiInfo,
  FiCheck,
  FiGift,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Footer from "../../components/student/Footer";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    getCartTotal,
    navigate,
    userData,
    purchaseCart, // Added secure cart checkout function
  } = useContext(AppContext);

  const [removingItem, setRemovingItem] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemoveItem = async (courseId) => {
    setRemovingItem(courseId);
    setTimeout(() => {
      removeFromCart(courseId);
      setRemovingItem(null);
    }, 300);
  };

  const handleClearCart = () => {
    if (showClearConfirm) {
      clearCart();
      setShowClearConfirm(false);
      toast.success("Cart cleared successfully!");
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!userData) {
      toast.warn("Please sign in to continue with checkout");
      return;
    }

    setIsCheckoutLoading(true);

    try {
      console.log("🛒 Starting secure cart checkout...");
      toast.info("Creating secure Stripe checkout session...");

      // Use the secure cart checkout function
      const result = await purchaseCart(cartItems);

      if (result.success) {
        console.log(
          `✅ Checkout session created for ${result.courseCount} courses`
        );
        console.log(`💰 Total amount: $${result.totalAmount}`);

        // Clear the cart since we're proceeding to payment
        clearCart();

        toast.success(
          `Redirecting to secure checkout for ${result.courseCount} course${
            result.courseCount > 1 ? "s" : ""
          }...`
        );

        // Small delay to show success message, then redirect
        setTimeout(() => {
          window.location.href = result.sessionUrl;
        }, 1500);
      } else {
        console.error("❌ Checkout failed:", result.error);
        toast.error(
          result.error || "Failed to create checkout session. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Checkout error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
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
    <div className="pb-20 md:pb-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-20">
      {/* Header Section - Enhanced */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FiShoppingBag className="text-blue-600 w-8 h-8" />
                  </div>
                  Shopping Cart
                </h1>
                <p className="text-gray-600 text-sm md:text-base mt-1">
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "course" : "courses"} ready for
                  checkout
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {cartItems.length > 0 && (
              <div className="hidden md:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    ${getCartTotal().toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 ${
                    isCheckoutLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isCheckoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-5 h-5" />
                      Secure Checkout
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartItems.length === 0 ? (
          /* Empty Cart - Enhanced with animations */
          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center animate-bounce">
                <FiShoppingBag className="w-16 h-16 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-500 font-bold">0</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Discover our amazing collection of courses and start building your
              skills today. Your learning journey is just one click away!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/course-list"
                className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <FiShoppingBag className="w-5 h-5" />
                Browse All Courses
              </Link>
              <Link
                to="/top-picks-courses"
                className="inline-flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold px-8 py-4 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <FiStar className="w-5 h-5" />
                View Top Rated
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Enhanced layout */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cart Header with actions */}
              <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900">
                  Cart Items ({cartItems.length})
                </h2>
                {cartItems.length > 1 && (
                  <button
                    onClick={handleClearCart}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      showClearConfirm
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "text-red-600 hover:bg-red-50 border border-red-200"
                    }`}
                  >
                    {showClearConfirm ? "Confirm Clear All" : "Clear All Items"}
                  </button>
                )}
              </div>

              {/* Course items */}
              {cartItems.map((course, index) => {
                const { finalPrice, originalPrice, hasDiscount } =
                  formatPrice(course);
                const isRemoving = removingItem === course._id;

                return (
                  <div
                    key={course._id}
                    className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 ${
                      isRemoving
                        ? "scale-95 opacity-50"
                        : "scale-100 opacity-100"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Course Image - Enhanced */}
                      <div className="relative w-full sm:w-40 h-24 sm:h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 group">
                        <img
                          src={course.courseThumbnail}
                          alt={course.courseTitle}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                        {hasDiscount && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            -
                            {Math.round(
                              ((originalPrice - finalPrice) / originalPrice) *
                                100
                            )}
                            % OFF
                          </div>
                        )}
                      </div>

                      {/* Course Info - Enhanced */}
                      <div className="flex-grow space-y-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                            {course.courseTitle}
                          </h3>
                          <p className="text-gray-600 text-sm flex items-center gap-2">
                            <FiUsers className="w-4 h-4" />
                            by {course.educator?.username || "Instructor"}
                          </p>
                        </div>

                        {/* Course Statistics */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiClock className="w-4 h-4" />
                            {course.courseDuration || "10h 30m"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUsers className="w-4 h-4" />
                            {course.enrolledStudents?.length || 0} students
                          </span>
                          <span className="flex items-center gap-1">
                            <FiStar className="w-4 h-4 text-yellow-500" />
                            4.8 rating
                          </span>
                        </div>

                        {/* Features */}
                        <div className="flex flex-wrap gap-2">
                          <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                            <FiCheck className="w-3 h-3" />
                            Lifetime Access
                          </span>
                          <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                            <FiGift className="w-3 h-3" />
                            Certificate
                          </span>
                        </div>

                        {/* Price and Actions */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-blue-600">
                              ${finalPrice.toFixed(2)}
                            </span>
                            {hasDiscount && (
                              <span className="text-lg text-gray-400 line-through bg-gray-50 px-2 py-1 rounded">
                                ${originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Add to Wishlist"
                            >
                              <FiHeart className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(course._id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 group"
                              title="Remove from Cart"
                            >
                              <FiTrash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary - Enhanced */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-4 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FiInfo className="w-5 h-5 text-blue-600" />
                  Order Summary
                </h3>

                {/* Order Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Courses ({cartItems.length})</span>
                    <span className="font-medium">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span className="text-green-600 font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    What you get:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      Lifetime access to all courses
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      Downloadable resources
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      Completion certificates
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck className="w-4 h-4 text-green-500" />
                      24/7 support access
                    </li>
                  </ul>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 shadow-lg mb-4 ${
                    isCheckoutLoading ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isCheckoutLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating Secure Session...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-5 h-5" />
                      Secure Checkout
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  🔒 Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
