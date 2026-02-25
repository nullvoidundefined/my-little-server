import db from "../db/pool.js";
import type { CreateRecruitingFirmInput, RecruitingFirm } from "../types/recruitingFirm.js";
import { buildUpdateClause } from "../utils/buildUpdateClause.js";

const RECRUITING_FIRM_COLUMNS = "id, name, website, linkedin_url, notes, created_at, updated_at";
const PATCH_FIELDS = ["linkedin_url", "name", "notes", "website"] as const;

export async function createRecruitingFirm(
  data: CreateRecruitingFirmInput,
): Promise<RecruitingFirm> {
  const { name, website, linkedin_url, notes } = data;
  const result = await db.query<RecruitingFirm>(
    `INSERT INTO recruiting_firms (name, website, linkedin_url, notes) VALUES ($1, $2, $3, $4) RETURNING ${RECRUITING_FIRM_COLUMNS}`,
    [name, website ?? null, linkedin_url ?? null, notes ?? null],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getRecruitingFirmsTotalCount(): Promise<number> {
  const result = await db.query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM recruiting_firms",
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function listRecruitingFirms(
  limit: number,
  offset: number,
): Promise<RecruitingFirm[]> {
  const result = await db.query<RecruitingFirm>(
    `SELECT ${RECRUITING_FIRM_COLUMNS} FROM recruiting_firms ORDER BY id LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
}

export async function getRecruitingFirmById(id: number): Promise<RecruitingFirm | null> {
  const result = await db.query<RecruitingFirm>(
    `SELECT ${RECRUITING_FIRM_COLUMNS} FROM recruiting_firms WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateRecruitingFirm(
  id: number,
  data: Partial<CreateRecruitingFirmInput>,
): Promise<RecruitingFirm | null> {
  const { setClause, values } = buildUpdateClause(
    PATCH_FIELDS,
    data as Partial<Record<(typeof PATCH_FIELDS)[number], string | number | null>>,
  );
  if (values.length === 0) throw new Error("At least one field required for update");
  values.push(id);
  const result = await db.query<RecruitingFirm>(
    `UPDATE recruiting_firms SET ${setClause} WHERE id = $${values.length} RETURNING ${RECRUITING_FIRM_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteRecruitingFirm(id: number): Promise<boolean> {
  const result = await db.query("DELETE FROM recruiting_firms WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
}
