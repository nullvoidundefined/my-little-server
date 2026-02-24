import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { httpLogger } from "./config/loggerConfig.js";
import db from "./database/utilities/connectionPool/connectionPool.js";
import { jobsRouter } from "./routes/jobs.js";
import { recruitersRouter } from "./routes/recruiters.js";
import { recruitingFirmsRouter } from "./routes/recruitingFirms.js";
import { errorHandler } from "./utils/errorHandler.js";
import { notFoundHandler } from "./utils/notFoundHandler.js";
import { rateLimiter } from "./utils/rateLimiter.js";

const app = express();

// Add security-related HTTP headers to reduce common web vulnerabilities (XSS, clickjacking, MIME sniffing, etc.).
app.use(helmet());

// Allow browser frontends to call this API while still controlling which origins are permitted.
app.use(
  cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  }),
);

// Attach structured request/response logging (with request IDs) early so all downstream handlers are observable.
app.use(httpLogger);

// Apply a basic rate limiter to protect the API from simple abuse and accidental client floods.
app.use(rateLimiter);

// Parse JSON request bodies and cap payload size to avoid unexpectedly large requests.
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded form submissions (e.g. HTML forms) with the same size cap as JSON.
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

db.query("SELECT NOW()")
  .then(() => console.log("Connected to database"))
  .catch((err: unknown) => console.error("Database connection failed", err));

app.use("/jobs", jobsRouter);
app.use("/recruiters", recruitersRouter);
app.use("/recruiting-firms", recruitingFirmsRouter);

// Attach reusable utilities for 404 and error handling.
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
