import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import type { Recruiter } from "../../../../types/recruiter.js";
import db from "../../../utilities/connectionPool/connectionPool.js";

const RECRUITER_COLUMNS = "id, name, email, phone, title, linkedin_url, firm_id, notes, created_at";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

async function listRecruiters(request: Request, response: Response) {
  const limit = Math.min(Math.max(1, Number(request.query.limit) || DEFAULT_LIMIT), MAX_LIMIT);
  const offset = Math.max(0, Number(request.query.offset) || 0);

  try {
    const result = await db.query<Recruiter>(
      `SELECT ${RECRUITER_COLUMNS} FROM recruiters ORDER BY id LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return response.json(result.rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiters");
    return response.status(500).json({ error: { message: "Failed to fetch recruiters" } });
  }
}

export { listRecruiters };
