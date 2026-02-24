import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import type { Job } from "../../../../types/job.js";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { parseIdParam } from "../../../../utils/parseIdParam.js";

const JOB_COLUMNS = "id, company, role, status, applied_date, notes, created_at, updated_at";

async function getJob(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: { message: "Invalid job ID" } });
  }

  try {
    const result = await db.query<Job>(
      `SELECT ${JOB_COLUMNS} FROM jobs WHERE id = $1`,
      [id],
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: { message: "Job not found" } });
    }

    return response.json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, "Failed to fetch job");
    return response.status(500).json({ error: { message: "Failed to fetch job" } });
  }
}

export { getJob };
