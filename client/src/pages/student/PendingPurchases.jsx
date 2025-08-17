import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import {
  FiClock,
  FiRefreshCw,
  FiXCircle,
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { toast } from "react-toastify";

const PendingPurchases = () => {
  const {
    pendingPurchases,
    pendingPurchasesLoading,
    fetchPendingPurchases,
    backendUrl,
    getToken,
  } = useContext(AppContext);

  // Loading states for individual buttons
  const [loadingButtons, setLoadingButtons] = useState({});

  useEffect(() => {
    fetchPendingPurchases();
  }, [fetchPendingPurchases]);

  // Debug logging
  console.log("🔍 Pending Purchases Debug:", {
    pendingPurchases,
    pendingPurchasesLoading,
    count: pendingPurchases?.length,
  });

  const handleRetryPayment = async (purchaseId) => {
    try {
      console.log(`🔄 Starting payment retry for purchase: ${purchaseId}`);

      // Set loading state for this specific button
      setLoadingButtons((prev) => ({ ...prev, [`retry-${purchaseId}`]: true }));

      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      // Show loading state
      toast.info("Creating new payment session...");

      const { data } = await axios.post(
        `${backendUrl}/api/user/retry-payment/${purchaseId}`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🎯 Retry payment response:", data);

      if (data.success && data.sessionUrl) {
        console.log(`✅ New Stripe session created: ${data.sessionId}`);
        console.log(`🔗 Redirecting to: ${data.sessionUrl}`);

        // Dismiss any existing toasts
        toast.dismiss();
        toast.success("Payment session created! Redirecting to Stripe...");

        // Small delay to show success message, then redirect
        setTimeout(() => {
          window.location.href = data.sessionUrl;
        }, 1000);
      } else {
        console.error("❌ No session URL in response:", data);
        toast.error(
          data.error || "Failed to create payment session. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error retrying payment:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to retry payment";
      toast.error(errorMessage);
    } finally {
      // Clear loading state
      setLoadingButtons((prev) => ({
        ...prev,
        [`retry-${purchaseId}`]: false,
      }));
    }
  };

  const handleCancelPurchase = async (purchaseId) => {
    // Show confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to cancel this purchase? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      console.log(`🚫 Cancelling purchase: ${purchaseId}`);

      // Set loading state for this specific button
      setLoadingButtons((prev) => ({
        ...prev,
        [`cancel-${purchaseId}`]: true,
      }));

      const token = await getToken();
      if (!token) {
        toast.error("Authentication required. Please sign in again.");
        return;
      }

      // Show loading state
      toast.info("Cancelling purchase...");

      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-payment/${purchaseId}`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🎯 Cancel payment response:", data);

      if (data.success) {
        toast.success("Purchase cancelled successfully");
        console.log(`✅ Purchase ${purchaseId} cancelled successfully`);

        // Refresh the pending purchases list to show updated data
        await fetchPendingPurchases();
      } else {
        console.error("❌ Failed to cancel purchase:", data);
        toast.error(
          data.error || "Failed to cancel purchase. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error cancelling purchase:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to cancel purchase";
      toast.error(errorMessage);
    } finally {
      // Clear loading state
      setLoadingButtons((prev) => ({
        ...prev,
        [`cancel-${purchaseId}`]: false,
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-500 bg-yellow-50";
      case "incomplete":
        return "text-orange-500 bg-orange-50";
      case "failed":
        return "text-red-500 bg-red-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  if (pendingPurchasesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 sm:h-40 bg-white rounded-lg shadow-sm"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-6 pt-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 pt-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Pending Purchases
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your incomplete course purchases
          </p>
        </div>

        {pendingPurchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
            <FiAlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              No Pending Purchases
            </h3>
            <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
              You don't have any pending or incomplete purchases at the moment.
              All your purchases are either completed or have been cancelled.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {pendingPurchases.map((purchase) => (
              <div
                key={purchase._id}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-all hover:shadow-md"
              >
                {/* Mobile-first responsive layout */}
                <div className="space-y-4">
                  {/* Course Info Section */}
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {purchase.courseDetails?.courseTitle ||
                            purchase.courseId?.courseTitle ||
                            "Course Title Not Available"}
                        </h3>
                        <span
                          className={`self-start px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(
                            purchase.status
                          )}`}
                        >
                          {purchase.status.charAt(0).toUpperCase() +
                            purchase.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <FiDollarSign
                        className="text-blue-500 flex-shrink-0"
                        size={18}
                      />
                      <span className="font-medium">
                        ${(purchase.amount || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar
                        className="text-blue-500 flex-shrink-0"
                        size={18}
                      />
                      <span className="truncate">
                        Created{" "}
                        {purchase.purchaseDate
                          ? new Date(purchase.purchaseDate).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock
                        className="text-blue-500 flex-shrink-0"
                        size={18}
                      />
                      <span className="truncate">
                        Updated{" "}
                        {purchase.lastUpdated
                          ? new Date(purchase.lastUpdated).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons - Always visible and properly sized */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleRetryPayment(purchase._id)}
                      disabled={
                        loadingButtons[`retry-${purchase._id}`] ||
                        loadingButtons[`cancel-${purchase._id}`]
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingButtons[`retry-${purchase._id}`] ? (
                        <>
                          <FiLoader
                            size={16}
                            className="flex-shrink-0 animate-spin"
                          />
                          <span>Creating Session...</span>
                        </>
                      ) : (
                        <>
                          <FiRefreshCw size={16} className="flex-shrink-0" />
                          <span>Complete Payment</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleCancelPurchase(purchase._id)}
                      disabled={
                        loadingButtons[`retry-${purchase._id}`] ||
                        loadingButtons[`cancel-${purchase._id}`]
                      }
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingButtons[`cancel-${purchase._id}`] ? (
                        <>
                          <FiLoader
                            size={16}
                            className="flex-shrink-0 animate-spin"
                          />
                          <span>Cancelling...</span>
                        </>
                      ) : (
                        <>
                          <FiXCircle size={16} className="flex-shrink-0" />
                          <span>Cancel Purchase</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingPurchases;
