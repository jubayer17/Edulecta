export const rawBodyMiddleware = (req, res, next) => {
  if (req.path === "/clerk" && req.method === "POST") {
    let data = "";
    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      req.rawBody = data;
      next();
    });

    req.on("error", (err) => {
      console.error("Error in rawBodyMiddleware:", err);
      if (!res.headersSent) {
        res.status(400).send("Invalid request");
      }
    });
  } else {
    next();
  }
};
