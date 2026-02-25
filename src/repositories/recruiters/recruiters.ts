import { buildUpdateClause } from "app/db/buildUpdateClause.js";
import db from "app/db/pool.js";
import type { CreateRecruiterInput, Recruiter } from "app/types/recruiter.js";

const RECRUITER_COLUMNS =
  "id, name, email, phone, title, linkedin_url, firm_id, notes, created_at, updated_at";
const PATCH_FIELDS = [
  "email",
  "firm_id",
  "linkedin_url",
  "name",
  "notes",
  "phone",
  "title",
] as const;

export async function createRecruiter(data: CreateRecruiterInput): Promise<Recruiter> {
  const { name, email, phone, title, linkedin_url, firm_id, notes } = data;
  const result = await db.query<Recruiter>(
    `INSERT INTO recruiters (name, email, phone, title, linkedin_url, firm_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${RECRUITER_COLUMNS}`,
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
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getRecruitersTotalCount(): Promise<number> {
  const result = await db.query<{ count: string }>("SELECT COUNT(*)::int AS count FROM recruiters");
  return Number(result.rows[0]?.count ?? 0);
}

export async function listRecruiters(limit: number, offset: number): Promise<Recruiter[]> {
  const result = await db.query<Recruiter>(
    `SELECT ${RECRUITER_COLUMNS} FROM recruiters ORDER BY id LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
}

export async function getRecruiterById(id: string): Promise<Recruiter | null> {
  const result = await db.query<Recruiter>(
    `SELECT ${RECRUITER_COLUMNS} FROM recruiters WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateRecruiter(
  id: string,
  data: Partial<CreateRecruiterInput>,
): Promise<Recruiter | null> {
  const { setClause, values } = buildUpdateClause(
    PATCH_FIELDS,
    data as Partial<Record<(typeof PATCH_FIELDS)[number], string | number | null>>,
  );
  if (values.length === 0) throw new Error("At least one field required for update");
  values.push(id);
  const result = await db.query<Recruiter>(
    `UPDATE recruiters SET ${setClause} WHERE id = $${values.length} RETURNING ${RECRUITER_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteRecruiter(id: string): Promise<boolean> {
  const result = await db.query("DELETE FROM recruiters WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
}
