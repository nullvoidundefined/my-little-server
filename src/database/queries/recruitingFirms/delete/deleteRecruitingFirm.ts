import type { Request, Response } from "express";

import db from "../../../utilities/connectionPool/connectionPool.js";

async function deleteRecruitingFirm(request: Request, response: Response) {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({ error: "Invalid recruiting firm ID" });
  }

  try {
    const result = await db.query("DELETE FROM recruiting_firms WHERE id = $1 RETURNING id", [id]);

    if (!result.rows[0]) {
      return response.status(404).json({ error: "Recruiting firm not found" });
    }

    return response.status(204).send();
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to delete recruiting firm" });
  }
}

export { deleteRecruitingFirm };
