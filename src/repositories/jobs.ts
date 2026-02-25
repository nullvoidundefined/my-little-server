import db from "../database/utilities/connectionPool/connectionPool.js";
import type { CreateJobInput, Job } from "../types/job.js";
import { buildUpdateClause } from "../utils/buildUpdateClause.js";

/** No user_id — single-user app; all data is shared. See README. */
const JOB_COLUMNS = "id, company, role, status, applied_date, notes, created_at, updated_at";
const PATCH_FIELDS = ["company", "role", "status", "applied_date", "notes"] as const;

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

export async function listJobs(limit: number, offset: number): Promise<Job[]> {
  const result = await db.query<Job>(
    `SELECT ${JOB_COLUMNS} FROM jobs ORDER BY id LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return result.rows;
}

export async function getJobById(id: number): Promise<Job | null> {
  const result = await db.query<Job>(
    `SELECT ${JOB_COLUMNS} FROM jobs WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function updateJob(
  id: number,
  data: Partial<CreateJobInput>,
): Promise<Job | null> {
  const { setClause, values } = buildUpdateClause(PATCH_FIELDS, data as Partial<Record<(typeof PATCH_FIELDS)[number], string | number | null>>);
  if (values.length === 0) throw new Error("At least one field required for update");
  values.push(id);
  const result = await db.query<Job>(
    `UPDATE jobs SET ${setClause} WHERE id = $${values.length} RETURNING ${JOB_COLUMNS}`,
    values,
  );
  return result.rows[0] ?? null;
}

export async function deleteJob(id: number): Promise<boolean> {
  const result = await db.query(
    "DELETE FROM jobs WHERE id = $1 RETURNING id",
    [id],
  );
  return (result.rowCount ?? 0) > 0;
}
