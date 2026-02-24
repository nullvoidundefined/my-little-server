import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import type { Recruiter } from "../../../../types/recruiter.js";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { parseIdParam } from "../../../../utils/parseIdParam.js";

const RECRUITER_COLUMNS =
  "id, name, email, phone, title, linkedin_url, firm_id, notes, created_at, updated_at";

async function getRecruiter(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: { message: "Invalid recruiter ID" } });
  }

  try {
    const result = await db.query<Recruiter>(
      `SELECT ${RECRUITER_COLUMNS} FROM recruiters WHERE id = $1`,
      [id],
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: { message: "Recruiter not found" } });
    }

    return response.json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiter");
    return response.status(500).json({ error: { message: "Failed to fetch recruiter" } });
  }
}

export { getRecruiter };
