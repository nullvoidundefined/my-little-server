import type { Request, Response } from "express";
import db from "../../../utilities/connectionPool/connectionPool.js";
import type { RecruitingFirm } from "../../../../types/recruitingFirm.js";

const RECRUITING_FIRM_COLUMNS = "id, name, website, linkedin_url, notes, created_at";

async function listRecruitingFirms(_request: Request, response: Response) {
  try {
    const result = await db.query<RecruitingFirm>(
      `SELECT ${RECRUITING_FIRM_COLUMNS} FROM recruiting_firms ORDER BY id`,
    );
    return response.json(result.rows);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to fetch recruiting firms" });
  }
}

export { listRecruitingFirms };
