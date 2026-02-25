import { buildUpdateClause } from "app/db/buildUpdateClause.js";
import db from "app/db/pool.js";
import type { CreateJobInput, Job } from "app/types/job.js";

/** No user_id — single-user app; all data is shared. See README. */
const JOB_COLUMNS = "id, company, role, status, applied_date, notes, created_at, updated_at";
const PATCH_FIELDS = ["company", "role", "status", "applied_date", "notes"] as const;
type JobPatchPayload = Partial<Record<(typeof PATCH_FIELDS)[number], string | number | null>>;

export async function createJob(data: CreateJobInput): Promise<Job> {
  const { company, role, status, applied_date, notes } = data;
  const result = await db.query<Job>(
    `INSERT INTO jobs (company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING ${JOB_COLUMNS}`,
    [company, role, status ?? null, applied_date ?? null, notes ?? null],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function getJobsTotalCount(): Promise<number> {
  const result = await db.query<{ count: string }>("SELECT COUNT(*)::int AS count FROM jobs");
  return Number(result.rows[0]?.count ?? 0);
}

export async function listJobs(limit: number, offset: number): Promise<Job[]> {
  const result = await db.query<Job>(
    `SELECT ${JOB_COLUMNS} FROM jobs ORDER BY created_at DESC, id DESC LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
}

export async function getJobById(id: string): Promise<Job | null> {
  const result = await db.query<Job>(`SELECT ${JOB_COLUMNS} FROM jobs WHERE id = $1`, [id]);
  return result.rows[0] ?? null;
}

export async function updateJob(id: string, data: JobPatchPayload): Promise<Job | null> {
  const { setClause, values } = buildUpdateClause(PATCH_FIELDS, data);
  if (values.length === 0) return null;
  values.push(id);
  const result = await db.query<Job>(
    `UPDATE jobs SET ${setClause} WHERE id = $${values.length} RETURNING ${JOB_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteJob(id: string): Promise<boolean> {
  const result = await db.query("DELETE FROM jobs WHERE id = $1 RETURNING id", [id]);
  return (result.rowCount ?? 0) > 0;
}
