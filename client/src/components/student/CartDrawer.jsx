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
import { toast } from "react-toastify";

const CartDrawer = () => {
  const {
    cartItems,
    isCartDrawerOpen,
    toggleCartDrawer,
    removeFromCart,
    getCartTotal,
    clearCart,
    userData,
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
      {/* Overlay - Enhanced with subtle blur */}
      <div
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${
          isCartDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleCartDrawer}
      />

      {/* Drawer - Refined and elegant design */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-all duration-300 ease-out ${
          isCartDrawerOpen ? "translate-x-0" : "translate-x-full"
        } ${isVisible ? "block" : "hidden"}`}
      >
        {/* Header - Refined with subtle gradient */}
        <div className="relative bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <FiShoppingBag className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Shopping Cart
                </h3>
                <p className="text-gray-500 text-sm">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleCartDrawer}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
            >
              <FiX className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col h-full pb-6">
          {cartItems.length === 0 ? (
            /* Empty Cart - Elegant empty state */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 font-medium text-xs">0</span>
                </div>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                Your cart is empty
              </h4>
              <p className="text-gray-500 text-sm mb-6 max-w-sm leading-relaxed">
                Discover amazing courses and start building your future today!
              </p>
              <Link
                to="/course-list"
                onClick={toggleCartDrawer}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items - Clean and refined design */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {cartItems.map((course) => {
                  const { finalPrice, originalPrice, hasDiscount } =
                    formatPrice(course);
                  const isRemoving = removingItem === course._id;

                  return (
                    <div
                      key={course._id}
                      className={`bg-white rounded-lg border border-gray-100 p-4 hover:shadow-sm transition-all duration-300 ${
                        isRemoving
                          ? "scale-95 opacity-50"
                          : "scale-100 opacity-100"
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Course Image - Refined */}
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                          <img
                            src={course.courseThumbnail}
                            alt={course.courseTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Course Info - Clean layout */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                            {course.courseTitle}
                          </h4>
                          <p className="text-xs text-gray-500 mb-2">
                            by Jubayer Ahmed
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-base font-semibold text-gray-900">
                                ${finalPrice.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${originalPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(course._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors duration-200"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Clear All Button - Simplified */}
                {cartItems.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="w-full mt-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors duration-200 text-sm"
                  >
                    Clear All ({cartItems.length})
                  </button>
                )}
              </div>

              {/* Footer - Clean and minimal design */}
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-4 space-y-4">
                {/* Total Section - Simplified */}
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">
                      Total ({cartItems.length} items)
                    </span>
                    <span className="text-xl font-semibold text-gray-900">
                      ${getCartTotal().toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Tax included</p>
                </div>

                {/* Action Buttons - Refined */}
                <div className="space-y-2">
                  <Link
                    to="/cart"
                    onClick={toggleCartDrawer}
                    className="w-full block text-center px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                  >
                    View Cart Details
                  </Link>
                  <button
                    onClick={() => {
                      if (!userData) {
                        toast.warn("Please sign in to continue with checkout");
                        return;
                      }
                      // Same checkout logic as Cart page
                      toast.info("Redirecting to Stripe checkout...");
                      console.log("Would redirect to Stripe for checkout");
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    <FiCreditCard className="w-4 h-4" />
                    Checkout ${getCartTotal().toFixed(2)}
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
