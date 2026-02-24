import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import { patchRecruiterSchema } from "../../../../schemas/recruiters.js";
import type { Recruiter } from "../../../../types/recruiter.js";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { parseIdParam } from "../../../../utils/parseIdParam.js";

const PATCH_FIELDS = [
  "email",
  "firm_id",
  "linkedin_url",
  "name",
  "notes",
  "phone",
  "title",
] as const;

async function updateRecruiter(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: { message: "Invalid recruiter ID" } });
  }

  const parsed = patchRecruiterSchema.safeParse(request.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return response.status(400).json({ error: { message } });
  }

  const data = parsed.data;
  const updates = PATCH_FIELDS.filter((field) => data[field] !== undefined);

  try {
    const setClauses = updates.map((field, index) => `${field} = $${index + 1}`).join(", ");

    const values: (string | number | null)[] = updates.map((field) => data[field] ?? null);
    values.push(id);

    const result = await db.query<Recruiter>(
      `UPDATE recruiters SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: { message: "Recruiter not found" } });
    }

    return response.json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, "Failed to update recruiter");
    return response.status(500).json({ error: { message: "Failed to update recruiter" } });
  }
}

export { updateRecruiter };
