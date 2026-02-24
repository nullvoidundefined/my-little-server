import type { Request, Response } from "express";
import db from "../../../utilities/connectionPool/connectionPool.js";

async function deleteRecruiter(request: Request, response: Response) {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return response.status(400).json({ error: "Invalid recruiter ID" });
  }

  try {
    const result = await db.query(
      "DELETE FROM recruiters WHERE id = $1 RETURNING id",
      [id],
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: "Recruiter not found" });
    }

    return response.status(204).send();
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to delete recruiter" });
  }
}

export { deleteRecruiter };

