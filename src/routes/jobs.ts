import express from "express";
import { z } from "zod";
import db from "../db.js";

const jobsRouter = express.Router();

const createJobSchema = z.object({
  applied_date: z.string().optional(),
  company: z.string().min(1, "company is required"),
  notes: z.string().optional(),
  role: z.string().min(1, "role is required"),
  status: z.string().optional(),
});

const patchJobSchema = z.object({
  applied_date: z.string().optional(),
  company: z.string().min(1).optional(),
  notes: z.string().optional(),
  role: z.string().min(1).optional(),
  status: z.string().optional(),
});

type CreateJobInput = z.infer<typeof createJobSchema>;
type PatchJobInput = z.infer<typeof patchJobSchema>;

interface JobRow {
  id: number;
  company: string;
  role: string;
  status: string | null;
  applied_date: string | null;
  notes: string | null;
  created_at: Date;
}

jobsRouter.get("/", async (_req, res) => {
  try {
    const result = await db.query<JobRow>("SELECT * FROM jobs ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

jobsRouter.post("/", async (req, res) => {
  const parsed = createJobSchema.safeParse(req.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return res.status(400).json({ error: message });
  }

  try {
    const { company, role, status, applied_date, notes }: CreateJobInput =
      parsed.data;
    const result = await db.query<JobRow>(
      "INSERT INTO jobs (company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [company, role, status ?? null, applied_date ?? null, notes ?? null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create job" });
  }
});

const PATCH_FIELDS = ["company", "role", "status", "applied_date", "notes"] as const;

jobsRouter.patch("/:id", async (req, res) => {
  const parsed = patchJobSchema.safeParse(req.body);

  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    return res.status(400).json({ error: message });
  }

  const data = parsed.data;
  const updates = PATCH_FIELDS.filter((f) => data[f] !== undefined);
  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    const setClauses = updates.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const values = updates.map((f) => data[f] ?? null);
    values.push(req.params.id);

    const result = await db.query<JobRow>(
      `UPDATE jobs SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values,
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update job" });
  }
});

jobsRouter.delete("/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM jobs WHERE id = $1 RETURNING id", [
      req.params.id,
    ]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete job" });
  }
});

export { jobsRouter };
