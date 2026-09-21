import express, { Application } from "express";
import cors from "cors";

import apiRouter from "./routes";

import { notFoundHandler } from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

/**
 * ============================================================
 * CORS Configuration
 * ============================================================
 *
 * Local development origins are included by default.
 *
 * Production frontend URL should be provided through:
 *
 * CLIENT_URL=https://cbe-it-support-ticket-system.vercel.app
 *
 * Multiple production URLs can be provided by separating them
 * with commas:
 *
 * CLIENT_URL=https://example1.com,https://example2.com
 */

const allowedOrigins: string[] = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",

  // Production frontend
  "https://cbe-it-support-ticket-system.vercel.app",
];

/**
 * Add additional origins from CLIENT_URL environment variable.
 */
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(",").forEach((url) => {
    const trimmedUrl = url.trim();

    if (trimmedUrl && !allowedOrigins.includes(trimmedUrl)) {
      allowedOrigins.push(trimmedUrl);
    }
  });
}

app.use(
  cors({
    origin: (origin, callback) => {
      /**
       * Allow requests without an Origin header.
       *
       * Examples:
       * - Postman
       * - cURL
       * - Server-to-server requests
       */
      if (!origin) {
        return callback(null, true);
      }

      /**
       * Allow only origins explicitly listed above.
       */
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      /**
       * Reject unknown origins.
       */
      return callback(
        new Error(`CORS policy: Origin ${origin} is not allowed`),
      );
    },

    /**
     * Required if your authentication uses cookies.
     */
    credentials: true,

    /**
     * Allowed HTTP methods.
     */
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    /**
     * Allowed request headers.
     */
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * ============================================================
 * Body Parser Middleware
 * ============================================================
 */

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/**
 * ============================================================
 * API Routes
 * ============================================================
 *
 * All API endpoints are prefixed with:
 *
 * /api
 *
 * Example:
 *
 * POST /api/auth/login
 */

app.use("/api", apiRouter);

/**
 * ============================================================
 * 404 Handler
 * ============================================================
 *
 * Handles requests to routes that do not exist.
 */

app.use(notFoundHandler);

/**
 * ============================================================
 * Global Error Handler
 * ============================================================
 */

app.use(errorHandler);

export default app;
