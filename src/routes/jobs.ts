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

type CreateJobInput = z.infer<typeof createJobSchema>;

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
    const message = parsed.error.issues.map((e: { message: string }) => e.message).join("; ");
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

export { jobsRouter };
