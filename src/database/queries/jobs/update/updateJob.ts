import type { Request, Response } from "express";

import { logger } from "../../../../config/loggerConfig.js";
import { patchJobSchema } from "../../../../schemas/jobs.js";
import type { Job } from "../../../../types/job.js";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { parseIdParam } from "../../../../utils/parseIdParam.js";

const PATCH_FIELDS = ["company", "role", "status", "applied_date", "notes"] as const;

async function updateJob(request: Request, response: Response) {
  const id = parseIdParam(request.params.id);

  if (id === null) {
    return response.status(400).json({ error: "Invalid job ID" });
  }

  const parsed = patchJobSchema.safeParse(request.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return response.status(400).json({ error: message });
  }

  const data = parsed.data;
  const updates = PATCH_FIELDS.filter((f) => data[f] !== undefined);

  try {
    const setClauses = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values: (string | number | null)[] = updates.map((f) => data[f] ?? null);
    values.push(id);

    const result = await db.query<Job>(
      `UPDATE jobs SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (!result.rows[0]) {
      return response.status(404).json({ error: "Job not found" });
    }

    return response.json(result.rows[0]);
  } catch (err) {
    logger.error({ err }, "Failed to update job");
    return response.status(500).json({ error: "Failed to update job" });
  }
}

export { updateJob };
