import type { Request, Response } from "express";
import type { ZodIssue } from "zod";

import * as jobsRepo from "app/repositories/jobs/jobs.js";
import { createJobSchema, patchJobSchema } from "app/schemas/jobs.js";
import { logger } from "app/utils/logs/logger.js";
import { parseIdParam } from "app/utils/parsers/parseIdParam.js";
import { parsePagination } from "app/utils/parsers/parsePagination.js";

export async function listJobs(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { limit, offset } = parsePagination(req.query.limit, req.query.offset);
    const [rows, total] = await Promise.all([
      jobsRepo.listJobs(userId, limit, offset),
      jobsRepo.getJobsTotalCount(userId),
    ]);
    res.json({ data: rows, meta: { total, limit, offset } });
  } catch (err) {
    logger.error({ err }, "Failed to fetch jobs");
    res.status(500).json({ error: { message: "Failed to fetch jobs" } });
  }
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid job ID" } });
    return;
  }
  try {
    const row = await jobsRepo.getJobById(req.user!.id, id);
    if (!row) {
      res.status(404).json({ error: { message: "Job not found" } });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to fetch job");
    res.status(500).json({ error: { message: "Failed to fetch job" } });
  }
}

export async function createJob(req: Request, res: Response): Promise<void> {
  const parsed = createJobSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e: ZodIssue) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  try {
    const row = await jobsRepo.createJob(req.user!.id, parsed.data);
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "Failed to create job");
    res.status(500).json({ error: { message: "Failed to create job" } });
  }
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid job ID" } });
    return;
  }
  const parsed = patchJobSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e: ZodIssue) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  try {
    const row = await jobsRepo.updateJob(req.user!.id, id, parsed.data);
    if (!row) {
      res.status(404).json({ error: { message: "Job not found" } });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to update job");
    res.status(500).json({ error: { message: "Failed to update job" } });
  }
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid job ID" } });
    return;
  }
  try {
    const deleted = await jobsRepo.deleteJob(req.user!.id, id);
    if (!deleted) {
      res.status(404).json({ error: { message: "Job not found" } });
      return;
    }
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete job");
    res.status(500).json({ error: { message: "Failed to delete job" } });
  }
}
