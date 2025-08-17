import React from "react";
import SubscriptionPlans from "../../components/student/SubscriptionPlans";
import Footer from "../../components/student/Footer";

const SubscriptionPlansPage = () => {
  return (
    <div className="pb-20 md:pb-0">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose the Perfect Plan for You
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Unlock unlimited learning potential with our flexible subscription
              plans. Start with a free trial and upgrade anytime.
            </p>
          </div>

          {/* Subscription Plans Component */}
          <SubscriptionPlans />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubscriptionPlansPage;
