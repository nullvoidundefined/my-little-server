import type { Request, Response } from "express";
import db from "../../../utilities/connectionPool/connectionPool.js";
import type { Job } from "../../../../types/job.js";

const JOB_COLUMNS = "id, company, role, status, applied_date, notes, created_at";

async function listJobs(_request: Request, response: Response) {
  try {
    const result = await db.query<Job>(`SELECT ${JOB_COLUMNS} FROM jobs ORDER BY id`);
    return response.json(result.rows);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to fetch jobs" });
  }
}

export { listJobs };
