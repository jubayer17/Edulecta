// Middleware to capture raw body for webhook signature verification
export const rawBodyMiddleware = (req, res, next) => {
  // Only process raw body for webhook endpoint
  if (req.path === "/clerk" && req.method === "POST") {
    let rawBody = "";

    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      rawBody += chunk;
    });

    req.on("end", () => {
      req.rawBody = rawBody;
      next();
    });

    req.on("error", (err) => {
      console.error("Error reading request body:", err);
      next(err);
    });
  } else {
    next();
  }
};
