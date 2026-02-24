import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import { createJobSchema } from "../../../../schemas/jobs.js";
import type { CreateJobInput, Job } from "../../../../types/job.js";
import db from "../../../utilities/connectionPool/connectionPool.js";

async function createJob(request: Request, response: Response) {
  const parsed = createJobSchema.safeParse(request.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return response.status(400).json({ error: { message } });
  }

  try {
    const { company, role, status, applied_date, notes }: CreateJobInput = parsed.data;
    const result = await db.query<Job>(
      "INSERT INTO jobs (company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [company, role, status ?? null, applied_date ?? null, notes ?? null],
    );
    return response.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, "Failed to create job");
    return response.status(500).json({ error: { message: "Failed to create job" } });
  }
}

export { createJob };
