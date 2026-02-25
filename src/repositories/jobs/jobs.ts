import { getPatchKeysAndValues } from "app/db/getPatchKeysAndValues/getPatchKeysAndValues.js";
import { query } from "app/db/pool/pool.js";
import type { CreateJobInput, Job } from "app/types/job.js";

const ALL_KEYS = "id, company, role, status, applied_date, notes, created_at, updated_at";
const PATCH_KEYS = ["company", "role", "status", "applied_date", "notes"] as const;
type JobPatchPayload = Partial<Record<(typeof PATCH_KEYS)[number], string | number | null>>;

export async function createJob(userId: string, data: CreateJobInput): Promise<Job> {
  const { company, role, status, applied_date, notes } = data;
  const result = await query<Job>(
    `INSERT INTO jobs (user_id, company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${ALL_KEYS}`,
    [userId, company, role, status ?? null, applied_date ?? null, notes ?? null],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getJobsTotalCount(userId: string): Promise<number> {
  const result = await query<{ count: string }>(
    "SELECT COUNT(*)::int AS count FROM jobs WHERE user_id = $1",
    [userId],
  );
  return Number(result.rows[0]?.count ?? 0);
}

export async function listJobs(userId: string, limit: number, offset: number): Promise<Job[]> {
  const result = await query<Job>(
    `SELECT ${ALL_KEYS} FROM jobs WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return result.rows;
}

export async function getJobById(userId: string, id: string): Promise<Job | null> {
  const result = await query<Job>(`SELECT ${PATCH_KEYS} FROM jobs WHERE id = $1 AND user_id = $2`, [
    id,
    userId,
  ]);
  return result.rows[0] ?? null;
}

export async function updateJob(
  userId: string,
  id: string,
  data: JobPatchPayload,
): Promise<Job | null> {
  const { keys, values } = getPatchKeysAndValues(PATCH_KEYS, data);
  if (values.length === 0) return null;
  values.push(id, userId);
  const idIdx = values.length - 1;
  const userIdx = values.length;
  const result = await query<Job>(
    `UPDATE jobs SET ${keys} WHERE id = $${idIdx} AND user_id = $${userIdx} RETURNING ${ALL_KEYS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteJob(userId: string, id: string): Promise<boolean> {
  const result = await query("DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING id", [
    id,
    userId,
  ]);
  return (result.rowCount ?? 0) > 0;
}
