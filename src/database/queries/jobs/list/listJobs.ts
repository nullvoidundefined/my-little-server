import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import type { Job } from "../../../../types/job.js";
import db from "../../../utilities/connectionPool/connectionPool.js";

const JOB_COLUMNS = "id, company, role, status, applied_date, notes, created_at, updated_at";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

async function listJobs(request: Request, response: Response) {
  const limit = Math.min(Math.max(1, Number(request.query.limit) || DEFAULT_LIMIT), MAX_LIMIT);
  const offset = Math.max(0, Number(request.query.offset) || 0);

  try {
    const result = await db.query<Job>(
      `SELECT ${JOB_COLUMNS} FROM jobs ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return response.json(result.rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch jobs");
    return response.status(500).json({ error: { message: "Failed to fetch jobs" } });
  }
}

export { listJobs };
