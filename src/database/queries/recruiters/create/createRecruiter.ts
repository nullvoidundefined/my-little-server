import type { Request, Response } from "express";

import { createRecruiterSchema } from "../../../../schemas/recruiters.js";
import type { CreateRecruiterInput, Recruiter } from "../../../../types/recruiter.js";
import db from "../../../utilities/connectionPool/connectionPool.js";

async function createRecruiter(request: Request, response: Response) {
  const parsed = createRecruiterSchema.safeParse(request.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return response.status(400).json({ error: message });
  }

  try {
    const { name, email, phone, title, linkedin_url, firm_id, notes }: CreateRecruiterInput =
      parsed.data;

    const result = await db.query<Recruiter>(
      "INSERT INTO recruiters (name, email, phone, title, linkedin_url, firm_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        name,
        email ?? null,
        phone ?? null,
        title ?? null,
        linkedin_url ?? null,
        firm_id ?? null,
        notes ?? null,
      ],
    );

    return response.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return response.status(500).json({ error: "Failed to create recruiter" });
  }
}

export { createRecruiter };
