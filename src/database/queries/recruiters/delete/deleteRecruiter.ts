import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { parseIdParam } from "../../../../utils/parseIdParam.js";

async function deleteRecruiter(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: { message: "Invalid recruiter ID" } });
  }

  try {
    const result = await db.query("DELETE FROM recruiters WHERE id = $1 RETURNING id", [id]);

    if (!result.rows[0]) {
      return response.status(404).json({ error: { message: "Recruiter not found" } });
    }

    return response.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete recruiter");
    return response.status(500).json({ error: { message: "Failed to delete recruiter" } });
  }
}

export { deleteRecruiter };
