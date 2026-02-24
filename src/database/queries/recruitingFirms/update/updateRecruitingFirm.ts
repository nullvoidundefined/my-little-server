import type { Request, Response } from "express";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { patchRecruitingFirmSchema } from "../../../../schemas/recruitingFirms.js";
import type { RecruitingFirm } from "../../../../types/recruitingFirm.js";

const PATCH_FIELDS = ["linkedin_url", "name", "notes", "website"] as const;

function parseIdParam(id: string): number | null {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? n : null;
}

async function updateRecruitingFirm(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: "Invalid recruiting firm ID" });
  }

  const parsed = patchRecruitingFirmSchema.safeParse(request.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return response.status(400).json({ error: message });
  }

  const data = parsed.data;
  const updates = PATCH_FIELDS.filter((field) => data[field] !== undefined);

  if (updates.length === 0) {
    return response.status(400).json({ error: "No fields to update" });
  }

  try {
    const setClauses = updates
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");

    const values: (string | number | null)[] = updates.map(
      (field) => data[field] ?? null,
    );
    values.push(id);

    const result = await db.query<RecruitingFirm>(
      `UPDATE recruiting_firms SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: "Recruiting firm not found" });
    }

    return response.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return response
      .status(500)
      .json({ error: "Failed to update recruiting firm" });
  }
}

export { updateRecruitingFirm };

