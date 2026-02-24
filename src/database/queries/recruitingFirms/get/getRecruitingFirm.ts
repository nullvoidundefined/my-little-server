import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import type { RecruitingFirm } from "../../../../types/recruitingFirm.js";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { parseIdParam } from "../../../../utils/parseIdParam.js";

const RECRUITING_FIRM_COLUMNS = "id, name, website, linkedin_url, notes, created_at, updated_at";

async function getRecruitingFirm(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: { message: "Invalid recruiting firm ID" } });
  }

  try {
    const result = await db.query<RecruitingFirm>(
      `SELECT ${RECRUITING_FIRM_COLUMNS} FROM recruiting_firms WHERE id = $1`,
      [id],
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: { message: "Recruiting firm not found" } });
    }

    return response.json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiting firm");
    return response.status(500).json({ error: { message: "Failed to fetch recruiting firm" } });
  }
}

export { getRecruitingFirm };
