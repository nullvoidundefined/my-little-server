import { buildUpdateClause } from "app/db/buildUpdateClause.js";
import { query } from "app/db/pool.js";
import type { CreateRecruitingFirmInput, RecruitingFirm } from "app/types/recruitingFirm.js";

const RECRUITING_FIRM_COLUMNS = "id, name, website, linkedin_url, notes, created_at, updated_at";
const PATCH_FIELDS = ["linkedin_url", "name", "notes", "website"] as const;

export async function createRecruitingFirm(
  data: CreateRecruitingFirmInput,
): Promise<RecruitingFirm> {
  const { name, website, linkedin_url, notes } = data;
  const result = await query<RecruitingFirm>(
    `INSERT INTO recruiting_firms (name, website, linkedin_url, notes) VALUES ($1, $2, $3, $4) RETURNING ${RECRUITING_FIRM_COLUMNS}`,
    [name, website ?? null, linkedin_url ?? null, notes ?? null],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getRecruitingFirmsTotalCount(): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM recruiting_firms",
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function listRecruitingFirms(
  limit: number,
  offset: number,
): Promise<RecruitingFirm[]> {
  const result = await query<RecruitingFirm>(
    `SELECT ${RECRUITING_FIRM_COLUMNS} FROM recruiting_firms ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
}

export async function getRecruitingFirmById(id: string): Promise<RecruitingFirm | null> {
  const result = await query<RecruitingFirm>(
    `SELECT ${RECRUITING_FIRM_COLUMNS} FROM recruiting_firms WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateRecruitingFirm(
  id: string,
  data: Partial<CreateRecruitingFirmInput>,
): Promise<RecruitingFirm | null> {
  const { setClause, values } = buildUpdateClause(
    PATCH_FIELDS,
    data as Partial<Record<(typeof PATCH_FIELDS)[number], string | number | null>>,
  );
  if (values.length === 0) return null;
  values.push(id);
  const result = await query<RecruitingFirm>(
    `UPDATE recruiting_firms SET ${setClause} WHERE id = $${values.length} RETURNING ${RECRUITING_FIRM_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteRecruitingFirm(id: string): Promise<boolean> {
  const result = await query("DELETE FROM recruiting_firms WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
}
