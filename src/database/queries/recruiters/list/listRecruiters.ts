import type { Request, Response } from "express";

import type { Recruiter } from "../../../../types/recruiter.js";
import db from "../../../utilities/connectionPool/connectionPool.js";

const RECRUITER_COLUMNS = "id, name, email, phone, title, linkedin_url, firm_id, notes, created_at";

async function listRecruiters(_request: Request, response: Response) {
  try {
    const result = await db.query<Recruiter>(
      `SELECT ${RECRUITER_COLUMNS} FROM recruiters ORDER BY id`,
    );
    return response.json(result.rows);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to fetch recruiters" });
  }
}

export { listRecruiters };
