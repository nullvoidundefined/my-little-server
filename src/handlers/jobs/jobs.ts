import type { Request, Response } from "express";
import type { ZodIssue } from "zod";

import { logger } from "app/config/loggerConfig.js";
import * as jobsRepo from "app/repositories/jobs.js";
import { createJobSchema, patchJobSchema } from "app/schemas/jobs.js";
import { parseIdParam } from "app/utils/parseIdParam.js";
import { parsePagination } from "app/utils/parsePagination.js";

export async function listJobs(req: Request, res: Response): Promise<void> {
  try {
    const { limit, offset } = parsePagination(req.query.limit, req.query.offset);
    const [rows, total] = await Promise.all([
      jobsRepo.listJobs(limit, offset),
      jobsRepo.getJobsTotalCount(),
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
    const row = await jobsRepo.getJobById(id);
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
    const row = await jobsRepo.createJob(parsed.data);
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
    const row = await jobsRepo.updateJob(id, parsed.data);
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
    const deleted = await jobsRepo.deleteJob(id);
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
