import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import {
  FiTrash2,
  FiShoppingBag,
  FiCreditCard,
  FiArrowLeft,
  FiHeart,
  FiStar,
  FiInfo,
  FiCheck,
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
    purchaseCart,
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

      const result = await purchaseCart(cartItems);

      if (result.success) {
        console.log(
          `✅ Checkout session created for ${result.courseCount} courses`
        );
        console.log(`💰 Total amount: $${result.totalAmount}`);

        clearCart();

        toast.success(
          `Redirecting to secure checkout for ${result.courseCount} course${
            result.courseCount > 1 ? "s" : ""
          }...`
        );

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
    <div className="pb-20 md:pb-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-600 group-hover:-translate-x-1 transition-transform" />
              </button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <FiShoppingBag className="text-blue-600 w-5 h-5" />
                  </div>
                  Shopping Cart
                </h1>
                <p className="text-gray-600 text-xs md:text-sm mt-1">
                  {cartItems.length}{" "}
                  {cartItems.length === 1 ? "course" : "courses"} ready for
                  checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-2 lg:px-3 py-3">
        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center animate-bounce">
                <FiShoppingBag className="w-12 h-12 text-blue-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-red-500 font-bold text-sm">0</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed text-sm">
              Discover our amazing collection of courses and start building your
              skills today. Your learning journey is just one click away!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items - Table Layout like MyCourses */}
            <div className="lg:col-span-2">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                  <h2 className="text-lg font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b border-gray-200/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Course Title
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Instructor
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {cartItems.map((course) => {
                        const { finalPrice, originalPrice, hasDiscount } =
                          formatPrice(course);
                        const isRemoving = removingItem === course._id;

                        return (
                          <tr
                            key={course._id}
                            className={`hover:bg-blue-50/30 transition-colors duration-200 ${
                              isRemoving ? "opacity-50" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                {/* Thumbnail */}
                                <div className="flex-shrink-0">
                                  <img
                                    src={course.courseThumbnail}
                                    alt={course.courseTitle}
                                    className="h-full max-h-16 w-16 object-cover rounded"
                                  />
                                </div>

                                {/* Text */}
                                <div className="flex flex-col justify-center">
                                  <p className="text-sm font-semibold text-gray-800 max-w-xs truncate">
                                    {course.courseTitle}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {course.enrolledStudents?.length || 0}{" "}
                                    students enrolled
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <p className="font-medium text-gray-800">
                                  {course.educator?.username ||
                                    "Unknown Instructor"}
                                </p>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <p className="font-semibold text-blue-600">
                                  ${finalPrice.toFixed(2)}
                                </p>
                                {hasDiscount && (
                                  <p className="text-xs text-gray-400 line-through">
                                    ${originalPrice.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Add to Wishlist"
                                >
                                  <FiHeart className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(course._id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 group"
                                  title="Remove from Cart"
                                >
                                  <FiTrash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Clear All Button */}
                {cartItems.length > 1 && (
                  <div className="p-4 border-t border-gray-200/60 bg-gray-50/30">
                    <button
                      onClick={handleClearCart}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        showClearConfirm
                          ? "bg-red-500 text-white hover:bg-red-600"
                          : "text-red-600 hover:bg-red-50 border border-red-200"
                      }`}
                    >
                      {showClearConfirm
                        ? "Confirm Clear All"
                        : "Clear All Items"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiInfo className="w-4 h-4 text-blue-600" />
                  Order Summary
                </h3>

                {/* Order Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Courses ({cartItems.length})</span>
                    <span className="font-medium">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Discount</span>
                    <span className="text-green-600 font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Tax</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-blue-50 rounded-xl p-3 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">
                    What you get:
                  </h4>
                  <ul className="space-y-1 text-xs text-gray-600">
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
                  className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md mb-3 ${
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
