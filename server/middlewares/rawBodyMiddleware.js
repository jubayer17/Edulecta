// Middleware to capture raw body for webhook signature verification
export const rawBodyMiddleware = (req, res, next) => {
  // Process raw body for webhook endpoints
  if (
    (req.path === "/clerk" || req.path === "/stripe") &&
    req.method === "POST"
  ) {
    // Check if body was already parsed
    if (req.body && typeof req.body !== "string") {
      console.log("Body already parsed, skipping raw body capture");
      return next();
    }

    let data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });

    req.on("end", () => {
      const rawBody = Buffer.concat(data);

      // Store both buffer and string versions
      req.rawBody = rawBody;
      req.rawBodyStr = rawBody.toString("utf8");

      // For Clerk webhooks, also parse JSON
      if (req.path === "/clerk") {
        try {
          req.body = JSON.parse(req.rawBodyStr);
        } catch (error) {
          console.error("Error parsing webhook body:", error);
          return res.status(400).json({ error: "Invalid JSON" });
        }
      }

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
