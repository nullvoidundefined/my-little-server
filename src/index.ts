import "dotenv/config";
import express from "express";
import db from "./db.js";
import { jobsRouter } from "./routes/jobs.js";

const app = express();
app.use(express.json());

// test db connection on startup
db.query("SELECT NOW()")
  .then(() => console.log("Connected to database"))
  .catch((err: unknown) => console.error("Database connection failed", err));

app.use("/jobs", jobsRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
