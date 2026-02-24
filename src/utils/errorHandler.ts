import type { NextFunction, Request, Response } from "express";

import { logger } from "../config/loggerConfig.js";

// Centralized error handler to ensure all uncaught errors are logged once and surfaced with a safe JSON response.
// The full error is only exposed in non-production environments to avoid leaking implementation details.

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const status = 500;
  const isProd = process.env.NODE_ENV === "production";

  logger.error({ err, reqId: req.id }, "Unhandled error in request handler");

  res.status(status).json({
    error: {
      message: isProd ? "Internal server error" : String(err),
    },
  });
}
