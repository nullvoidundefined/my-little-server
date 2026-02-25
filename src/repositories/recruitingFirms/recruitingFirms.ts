import { getPatchKeysAndValues } from "app/db/getPatchKeysAndValues/getPatchKeysAndValues.js";
import { query } from "app/db/pool/pool.js";
import type { CreateRecruitingFirmInput, RecruitingFirm } from "app/types/recruitingFirm.js";

const ALL_KEYS = "id, name, website, linkedin_url, notes, created_at, updated_at";
const PATCH_KEYS = ["linkedin_url", "name", "notes", "website"] as const;

export async function createRecruitingFirm(
  userId: string,
  data: CreateRecruitingFirmInput,
): Promise<RecruitingFirm> {
  const { name, website, linkedin_url, notes } = data;
  const result = await query<RecruitingFirm>(
    `INSERT INTO recruiting_firms (user_id, name, website, linkedin_url, notes) VALUES ($1, $2, $3, $4, $5) RETURNING ${ALL_KEYS}`,
    [userId, name, website ?? null, linkedin_url ?? null, notes ?? null],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getRecruitingFirmsTotalCount(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM recruiting_firms WHERE user_id = $1",
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function listRecruitingFirms(
  userId: string,
  limit: number,
  offset: number,
): Promise<RecruitingFirm[]> {
  const result = await query<RecruitingFirm>(
    `SELECT ${ALL_KEYS} FROM recruiting_firms WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return result.rows;
}

export async function getRecruitingFirmById(
  userId: string,
  id: string,
): Promise<RecruitingFirm | null> {
  const result = await query<RecruitingFirm>(
    `SELECT ${ALL_KEYS} FROM recruiting_firms WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return result.rows[0] ?? null;
}

export async function updateRecruitingFirm(
  userId: string,
  id: string,
  data: Partial<CreateRecruitingFirmInput>,
): Promise<RecruitingFirm | null> {
  const { keys, values } = getPatchKeysAndValues(
    PATCH_KEYS,
    data as Partial<Record<(typeof PATCH_KEYS)[number], string | number | null>>,
  );
  if (values.length === 0) return null;
  values.push(id, userId);
  const idIdx = values.length - 1;
  const userIdx = values.length;
  const result = await query<RecruitingFirm>(
    `UPDATE recruiting_firms SET ${keys} WHERE id = $${idIdx} AND user_id = $${userIdx} RETURNING ${ALL_KEYS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteRecruitingFirm(userId: string, id: string): Promise<boolean> {
  const result = await query(
    "DELETE FROM recruiting_firms WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId],
  );
  return (result.rowCount ?? 0) > 0;
}
