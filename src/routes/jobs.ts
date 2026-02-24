import express from "express";

import { createJob } from "../database/queries/jobs/create/createJob.js";
import { deleteJob } from "../database/queries/jobs/delete/deleteJob.js";
import { getJob } from "../database/queries/jobs/get/getJob.js";
import { listJobs } from "../database/queries/jobs/list/listJobs.js";
import { updateJob } from "../database/queries/jobs/update/updateJob.js";

const jobsRouter = express.Router();

jobsRouter.get("/", listJobs);
jobsRouter.get("/:id", getJob);
jobsRouter.post("/", createJob);
jobsRouter.patch("/:id", updateJob);
jobsRouter.delete("/:id", deleteJob);

export { jobsRouter };
