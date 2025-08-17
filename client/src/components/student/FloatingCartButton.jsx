import React, { useContext } from "react";
import { FiShoppingBag, FiX } from "react-icons/fi";
import { AppContext } from "../../context/AppContext";

const FloatingCartButton = () => {
  const {
    cartItems = [],
    toggleCartDrawer,
    cartVibrating = false,
    isCartDrawerOpen = false,
  } = useContext(AppContext);

  // Don't show if cart is empty
  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="hidden md:block fixed bottom-6 right-6 z-40">
      <button
        onClick={toggleCartDrawer}
        className={`
          relative bg-gradient-to-r from-blue-500 to-purple-600 text-white 
          rounded-full p-4 shadow-xl hover:shadow-2xl
          transform transition-all duration-300 ease-in-out
          hover:scale-110 active:scale-95
          ${cartVibrating ? "animate-bounce" : ""}
          ${isCartDrawerOpen ? "rotate-45" : "rotate-0"}
        `}
        style={{
          boxShadow:
            "0 10px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Background pulse effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-ping opacity-20"></div>

        {/* Icon */}
        <div className="relative z-10">
          {isCartDrawerOpen ? (
            <FiX className="w-6 h-6 transition-transform duration-200" />
          ) : (
            <FiShoppingBag className="w-6 h-6 transition-transform duration-200" />
          )}
        </div>

        {/* Cart Count Badge */}
        {cartItems.length > 0 && !isCartDrawerOpen && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[24px] h-6 flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg">
            {cartItems.length > 99 ? "99+" : cartItems.length}
          </div>
        )}

        {/* Vibration ripple effect */}
        {cartVibrating && (
          <div className="absolute inset-0 rounded-full border-4 border-white opacity-60 animate-ping"></div>
        )}
      </button>
    </div>
  );
};

export default FloatingCartButton;
