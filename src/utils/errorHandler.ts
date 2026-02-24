import type { NextFunction, Request, Response } from "express";

// Centralized error handler to ensure all uncaught errors are logged once and surfaced with a safe JSON response.
// The full error is only exposed in non-production environments to avoid leaking implementation details.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  const status = 500;
  const isProd = process.env.NODE_ENV === "production";

  // Log the error; HTTP logging middleware already includes a request id, method, and URL for correlation.
  // Using console here keeps this handler decoupled from any particular logging implementation.
  // eslint-disable-next-line no-console
  console.error("Unhandled error in request handler", err);

  res.status(status).json({
    error: {
      message: isProd ? "Internal server error" : String(err),
    },
  });
}
