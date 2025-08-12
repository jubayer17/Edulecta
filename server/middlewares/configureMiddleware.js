import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";

export const configureMiddleware = (app) => {
  // Apply CORS middleware
  app.use(cors());

  // Special handling for webhook routes must be before json parsing
  app.use((req, res, next) => {
    if (req.path === "/stripe" || req.path === "/clerk") {
      express.raw({
        type: "application/json",
        limit: "10mb",
      })(req, res, next);
    } else {
      next();
    }
  });

  // Apply URL-encoded parsing for form data
  app.use(express.urlencoded({ extended: true }));

  // Apply JSON parsing for non-webhook routes and non-multipart requests
  app.use((req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (
      req.path !== "/stripe" &&
      req.path !== "/clerk" &&
      !contentType.includes("multipart/form-data")
    ) {
      express.json()(req, res, next);
    } else {
      next();
    }
  });

  // Apply Clerk middleware after body parsing
  app.use(clerkMiddleware());

  // Add error handling middleware
  app.use((err, req, res, next) => {
    console.error("Middleware Error:", err);
    let statusCode = err.statusCode || 500;
    let errorMessage =
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal Server Error";

    // Handle specific error types
    if (err.name === "UnauthorizedError") {
      statusCode = 401;
      errorMessage = "Authentication required";
    }

    res.status(statusCode).json({
      error: true,
      message: errorMessage,
    });
  });
};
