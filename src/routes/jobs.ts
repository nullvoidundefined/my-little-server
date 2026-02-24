import express from "express";

import * as jobsHandlers from "../handlers/jobs.js";

const jobsRouter = express.Router();

jobsRouter.get("/", jobsHandlers.listJobs);
jobsRouter.get("/:id", jobsHandlers.getJob);
jobsRouter.post("/", jobsHandlers.createJob);
jobsRouter.patch("/:id", jobsHandlers.updateJob);
jobsRouter.delete("/:id", jobsHandlers.deleteJob);

export { jobsRouter };
