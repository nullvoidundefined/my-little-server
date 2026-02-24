import "dotenv/config";
import express from "express";
import db from "./database/utilities/connectionPool/connectionPool.js";
import { jobsRouter } from "./routes/jobs.js";
import { recruitersRouter } from "./routes/recruiters.js";
import { recruitingFirmsRouter } from "./routes/recruitingFirms.js";

const app = express();
// TODO: Add authentication/authorization before exposing this API publicly.
app.use(express.json({ limit: "10kb" }));

// test db connection on startup
db.query("SELECT NOW()")
  .then(() => console.log("Connected to database"))
  .catch((err: unknown) => console.error("Database connection failed", err));

app.use("/jobs", jobsRouter);
app.use("/recruiters", recruitersRouter);
app.use("/recruiting-firms", recruitingFirmsRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
