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
} from "react-icons/fi";
import { toast } from "react-toastify";

const PendingPurchases = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { backendUrl, getToken } = useContext(AppContext);

  const fetchPendingPurchases = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/purchases`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter and format pending purchases
      const pendingPurchases = data.purchases
        .filter((purchase) =>
          ["pending", "incomplete", "failed"].includes(purchase.status)
        )
        .filter((purchase) => purchase.courseId); // Only include purchases with valid courseId

      // Get course details for each purchase
      const purchasesWithDetails = await Promise.all(
        pendingPurchases.map(async (purchase) => {
          if (!purchase.courseId) return purchase;

          try {
            const courseResponse = await axios.get(
              `${backendUrl}/api/course/get-course/${purchase.courseId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (courseResponse.data.success && courseResponse.data.course) {
              return {
                ...purchase,
                courseDetails: courseResponse.data.course,
              };
            }
            console.log(`No course data found for ${purchase.courseId}`);
            return purchase;
          } catch (error) {
            console.error(
              `Error fetching course details for ${purchase.courseId}:`,
              error
            );
            return purchase;
          }
        })
      );

      // Filter out any purchases without course details
      const validPurchases = purchasesWithDetails.filter(
        (purchase) =>
          purchase.courseId &&
          (purchase.courseDetails || purchase.courseId?.courseTitle)
      );

      setPurchases(validPurchases);
    } catch (error) {
      toast.error("Failed to fetch pending purchases");
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPurchases();
  }, []);

  const handleRetryPayment = async (purchaseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/retry-payment/${purchaseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      toast.error("Failed to retry payment");
      console.error("Error retrying payment:", error);
    }
  };

  const handleCancelPurchase = async (purchaseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-payment/${purchaseId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Purchase cancelled successfully");
        fetchPendingPurchases(); // Refresh the list
      }
    } catch (error) {
      toast.error("Failed to cancel purchase");
      console.error("Error cancelling purchase:", error);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-white rounded-lg shadow-sm"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Pending Purchases
          </h1>
          <p className="text-gray-600">
            Manage your incomplete course purchases
          </p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiAlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Pending Purchases
            </h3>
            <p className="text-gray-600">
              You don't have any pending or incomplete purchases at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase._id}
                className="bg-white rounded-xl shadow-sm p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 truncate">
                          {purchase.courseDetails?.courseTitle ||
                            purchase.courseId?.courseTitle ||
                            "Course Title Not Available"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {purchase.courseDetails?.courseDescription || ""}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          purchase.status
                        )}`}
                      >
                        {purchase.status.charAt(0).toUpperCase() +
                          purchase.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-blue-500" size={18} />
                        <span className="font-medium">
                          ${(purchase.amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-blue-500" size={18} />
                        <span>
                          Created{" "}
                          {purchase.purchaseDate
                            ? new Date(
                                purchase.purchaseDate
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Date not available"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiClock className="text-blue-500" size={18} />
                        <span>
                          Updated{" "}
                          {purchase.lastUpdated
                            ? new Date(purchase.lastUpdated).toLocaleDateString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Not available"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleRetryPayment(purchase._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FiRefreshCw size={16} />
                      <span>Retry Payment</span>
                    </button>
                    <button
                      onClick={() => handleCancelPurchase(purchase._id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <FiXCircle size={16} />
                      <span>Cancel</span>
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
