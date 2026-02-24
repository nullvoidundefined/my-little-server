import type { Request, Response } from "express";

import { logger } from "../config/loggerConfig.js";
import * as recruitersRepo from "../repositories/recruiters.js";
import { createRecruiterSchema, patchRecruiterSchema } from "../schemas/recruiters.js";
import { parseIdParam } from "../utils/parseIdParam.js";
import { parsePagination } from "../utils/parsePagination.js";

export async function listRecruiters(req: Request, res: Response): Promise<void> {
  try {
    const { limit, offset } = parsePagination(req.query.limit, req.query.offset);
    const rows = await recruitersRepo.listRecruiters(limit, offset);
    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiters");
    res.status(500).json({ error: { message: "Failed to fetch recruiters" } });
  }
}

export async function getRecruiter(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid recruiter ID" } });
    return;
  }
  try {
    const row = await recruitersRepo.getRecruiterById(id);
    if (!row) {
      res.status(404).json({ error: { message: "Recruiter not found" } });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiter");
    res.status(500).json({ error: { message: "Failed to fetch recruiter" } });
  }
}

export async function createRecruiter(req: Request, res: Response): Promise<void> {
  const parsed = createRecruiterSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  try {
    const row = await recruitersRepo.createRecruiter(parsed.data);
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "Failed to create recruiter");
    res.status(500).json({ error: { message: "Failed to create recruiter" } });
  }
}

export async function updateRecruiter(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid recruiter ID" } });
    return;
  }
  const parsed = patchRecruiterSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  try {
    const row = await recruitersRepo.updateRecruiter(id, parsed.data);
    if (!row) {
      res.status(404).json({ error: { message: "Recruiter not found" } });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to update recruiter");
    res.status(500).json({ error: { message: "Failed to update recruiter" } });
  }
}

export async function deleteRecruiter(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid recruiter ID" } });
    return;
  }
  try {
    const deleted = await recruitersRepo.deleteRecruiter(id);
    if (!deleted) {
      res.status(404).json({ error: { message: "Recruiter not found" } });
      return;
    }
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete recruiter");
    res.status(500).json({ error: { message: "Failed to delete recruiter" } });
  }
}
