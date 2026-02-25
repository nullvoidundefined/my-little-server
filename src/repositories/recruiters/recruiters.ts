import { getPatchKeysAndValues } from "app/db/getPatchKeysAndValues/getPatchKeysAndValues.js";
import { query } from "app/db/pool/pool.js";
import type { CreateRecruiterInput, Recruiter } from "app/types/recruiter.js";

const ALL_KEYS =
  "id, name, email, phone, title, linkedin_url, firm_id, notes, created_at, updated_at";

const PATCH_KEYS = ["email", "firm_id", "linkedin_url", "name", "notes", "phone", "title"] as const;

export async function createRecruiter(
  userId: string,
  data: CreateRecruiterInput,
): Promise<Recruiter> {
  const { name, email, phone, title, linkedin_url, firm_id, notes } = data;
  const result = await query<Recruiter>(
    `INSERT INTO recruiters (user_id, name, email, phone, title, linkedin_url, firm_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING ${ALL_KEYS}`,
    [
      userId,
      name,
      email ?? null,
      phone ?? null,
      title ?? null,
      linkedin_url ?? null,
      firm_id ?? null,
      notes ?? null,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getRecruitersTotalCount(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM recruiters WHERE user_id = $1",
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function listRecruiters(
  userId: string,
  limit: number,
  offset: number,
): Promise<Recruiter[]> {
  const result = await query<Recruiter>(
    `SELECT ${ALL_KEYS} FROM recruiters WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return result.rows;
}

export async function getRecruiterById(userId: string, id: string): Promise<Recruiter | null> {
  const result = await query<Recruiter>(
    `SELECT ${ALL_KEYS} FROM recruiters WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function updateRecruiter(
  userId: string,
  id: string,
  data: Partial<CreateRecruiterInput>,
): Promise<Recruiter | null> {
  const { keys, values } = getPatchKeysAndValues(
    PATCH_KEYS,
    data as Partial<Record<(typeof PATCH_KEYS)[number], string | number | null>>,
  );
  if (values.length === 0) return null;
  values.push(id, userId);
  const idIdx = values.length - 1;
  const userIdx = values.length;
  const result = await query<Recruiter>(
    `UPDATE recruiters SET ${keys} WHERE id = $${idIdx} AND user_id = $${userIdx} RETURNING ${ALL_KEYS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteRecruiter(userId: string, id: string): Promise<boolean> {
  const result = await query("DELETE FROM recruiters WHERE id = $1 AND user_id = $2 RETURNING id", [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
