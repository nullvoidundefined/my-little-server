import type { Request, Response } from "express";

import { createRecruitingFirmSchema } from "../../../../schemas/recruitingFirms.js";
import type {
  CreateRecruitingFirmInput,
  RecruitingFirm,
} from "../../../../types/recruitingFirm.js";
import db from "../../../utilities/connectionPool/connectionPool.js";

async function createRecruitingFirm(request: Request, response: Response) {
  const parsed = createRecruitingFirmSchema.safeParse(request.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return response.status(400).json({ error: message });
  }

  try {
    const { name, website, linkedin_url, notes }: CreateRecruitingFirmInput = parsed.data;

    const result = await db.query<RecruitingFirm>(
      "INSERT INTO recruiting_firms (name, website, linkedin_url, notes) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, website ?? null, linkedin_url ?? null, notes ?? null],
    );

    return response.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to create recruiting firm" });
  }
}

export { createRecruitingFirm };
