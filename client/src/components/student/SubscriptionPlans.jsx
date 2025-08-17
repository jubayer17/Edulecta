import React, { useState } from "react";
import { FiCheck, FiStar, FiZap, FiCreditCard, FiAward } from "react-icons/fi";
import { toast } from "react-toastify";

const SubscriptionPlans = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loading, setLoading] = useState(null);

  // Stripe payment handler
  const handleSubscription = async (plan) => {
    setLoading(plan.id);

    try {
      // In a real implementation, you would:
      // 1. Create a checkout session with your backend
      // 2. Redirect to Stripe Checkout
      // 3. Handle success/cancel redirects

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: billingCycle,
          priceId: plan.stripePrice[billingCycle],
        }),
      });

      const session = await response.json();

      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for beginners",
      icon: FiZap,
      color: "blue",
      price: {
        monthly: 9.99,
        yearly: 99.99,
      },
      stripePrice: {
        monthly: "price_basic_monthly", // Replace with actual Stripe price ID
        yearly: "price_basic_yearly", // Replace with actual Stripe price ID
      },
      features: [
        "Access to 100+ courses",
        "Basic video quality",
        "Email support",
        "Mobile app access",
        "Basic certificates",
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Most popular choice",
      icon: FiStar,
      color: "purple",
      price: {
        monthly: 19.99,
        yearly: 199.99,
      },
      stripePrice: {
        monthly: "price_pro_monthly", // Replace with actual Stripe price ID
        yearly: "price_pro_yearly", // Replace with actual Stripe price ID
      },
      features: [
        "Access to 500+ courses",
        "HD video quality",
        "Priority support",
        "Mobile & desktop apps",
        "Verified certificates",
        "Downloadable content",
        "1-on-1 mentorship sessions",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      description: "For serious learners",
      icon: FiAward,
      color: "gold",
      price: {
        monthly: 39.99,
        yearly: 399.99,
      },
      stripePrice: {
        monthly: "price_premium_monthly", // Replace with actual Stripe price ID
        yearly: "price_premium_yearly", // Replace with actual Stripe price ID
      },
      features: [
        "Access to all courses",
        "4K video quality",
        "24/7 priority support",
        "All device access",
        "Industry-recognized certificates",
        "Offline downloads",
        "Weekly 1-on-1 mentorship",
        "Career guidance",
        "Exclusive webinars",
      ],
      popular: false,
    },
  ];

  const handleSubscribe = async (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      toast.error("Plan not found");
      return;
    }

    await handleSubscription(plan);
  };

  const getColorClasses = (color, variant = "primary") => {
    const colors = {
      blue: {
        primary: "from-blue-500 to-blue-600",
        light: "from-blue-50 to-blue-100",
        text: "text-blue-600",
        border: "border-blue-200",
        bg: "bg-blue-50",
      },
      purple: {
        primary: "from-purple-500 to-purple-600",
        light: "from-purple-50 to-purple-100",
        text: "text-purple-600",
        border: "border-purple-200",
        bg: "bg-purple-50",
      },
      gold: {
        primary: "from-yellow-500 to-orange-500",
        light: "from-yellow-50 to-orange-100",
        text: "text-yellow-600",
        border: "border-yellow-200",
        bg: "bg-yellow-50",
      },
    };
    return colors[color][variant];
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-6 sm:px-4 md:px-6 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <FiAward className="text-white text-xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Choose Your Plan
          </h2>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
          Unlock unlimited learning potential with our flexible subscription
          plans
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span
            className={`text-sm font-medium ${
              billingCycle === "monthly" ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() =>
              setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")
            }
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              billingCycle === "yearly" ? "bg-purple-600" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                billingCycle === "yearly" ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              billingCycle === "yearly" ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Yearly
          </span>
          {billingCycle === "yearly" && (
            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-medium">
              Save 17%
            </span>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = plan.price[billingCycle];
          const yearlyDiscount =
            billingCycle === "yearly"
              ? Math.round(
                  (1 - plan.price.yearly / (plan.price.monthly * 12)) * 100
                )
              : 0;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? `${getColorClasses(
                      plan.color,
                      "border"
                    )} transform lg:scale-105`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div
                  className={`absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-gradient-to-r ${getColorClasses(
                    plan.color
                  )} text-white rounded-full text-sm font-semibold shadow-lg`}
                >
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <div
                    className={`inline-flex p-3 rounded-full bg-gradient-to-r ${getColorClasses(
                      plan.color,
                      "light"
                    )} mb-4`}
                  >
                    <Icon
                      className={`w-6 h-6 ${getColorClasses(
                        plan.color,
                        "text"
                      )}`}
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      ${price}
                    </span>
                    <span className="text-gray-600">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && yearlyDiscount > 0 && (
                    <p className="text-green-600 text-sm font-medium mt-1">
                      Save {yearlyDiscount}% with yearly billing
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <FiCheck
                        className={`w-5 h-5 ${getColorClasses(
                          plan.color,
                          "text"
                        )} flex-shrink-0`}
                      />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    plan.popular
                      ? `bg-gradient-to-r ${getColorClasses(
                          plan.color
                        )} text-white hover:shadow-lg transform hover:scale-105`
                      : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } ${
                    loading === plan.id ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {loading === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCreditCard className="w-4 h-4" />
                      {plan.popular ? "Start Free Trial" : "Get Started"}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. Cancel anytime.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-500" />
            <span>No setup fees</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-500" />
            <span>24/7 support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionPlans;
