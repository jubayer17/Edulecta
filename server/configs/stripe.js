import Stripe from "stripe";

let stripeInstance = null;

export const getStripeInstance = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY environment variable is not set");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16", // Use latest stable version
      typescript: false,
    });
  }
  return stripeInstance;
};

export const validateStripeSignature = (req) => {
  const signature = req.headers["stripe-signature"];

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET environment variable is not set");
  }

  try {
    const event = getStripeInstance().webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    throw new Error(`Webhook Error: ${err.message}`);
  }
};

export const handleStripeError = (error) => {
  const errorResponse = {
    success: false,
    error: "Payment processing error",
  };

  if (error instanceof Stripe.errors.StripeError) {
    switch (error.type) {
      case "StripeCardError":
        errorResponse.error = "Your card was declined.";
        break;
      case "StripeRateLimitError":
        errorResponse.error = "Too many requests. Please try again later.";
        break;
      case "StripeInvalidRequestError":
        errorResponse.error = "Invalid payment information.";
        break;
      case "StripeAPIError":
        errorResponse.error = "Payment system error. Please try again later.";
        break;
      case "StripeConnectionError":
        errorResponse.error = "Network error. Please check your connection.";
        break;
      case "StripeAuthenticationError":
        console.error("Stripe Authentication Error:", error);
        errorResponse.error = "Payment system configuration error.";
        break;
      default:
        errorResponse.error = "An unexpected error occurred.";
    }
  }

  return errorResponse;
};
