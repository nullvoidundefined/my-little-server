import type { Request, Response } from "express";
import type { ZodIssue } from "zod";

import { logger } from "app/config/loggerConfig.js";
import * as recruitingFirmsRepo from "app/repositories/recruitingFirms/recruitingFirms.js";
import {
  createRecruitingFirmSchema,
  patchRecruitingFirmSchema,
} from "app/schemas/recruitingFirms.js";
import { parseIdParam } from "app/utils/parseIdParam.js";
import { parsePagination } from "app/utils/parsePagination.js";

export async function listRecruitingFirms(req: Request, res: Response): Promise<void> {
  try {
    const { limit, offset } = parsePagination(req.query.limit, req.query.offset);
    const [rows, total] = await Promise.all([
      recruitingFirmsRepo.listRecruitingFirms(limit, offset),
      recruitingFirmsRepo.getRecruitingFirmsTotalCount(),
    ]);
    res.json({ data: rows, meta: { total, limit, offset } });
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiting firms");
    res.status(500).json({ error: { message: "Failed to fetch recruiting firms" } });
  }
}

export async function getRecruitingFirm(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid recruiting firm ID" } });
    return;
  }
  try {
    const row = await recruitingFirmsRepo.getRecruitingFirmById(id);
    if (!row) {
      res.status(404).json({ error: { message: "Recruiting firm not found" } });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to fetch recruiting firm");
    res.status(500).json({ error: { message: "Failed to fetch recruiting firm" } });
  }
}

export async function createRecruitingFirm(req: Request, res: Response): Promise<void> {
  const parsed = createRecruitingFirmSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e: ZodIssue) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  try {
    const row = await recruitingFirmsRepo.createRecruitingFirm(parsed.data);
    res.status(201).json(row);
  } catch (err) {
    logger.error({ err }, "Failed to create recruiting firm");
    res.status(500).json({ error: { message: "Failed to create recruiting firm" } });
  }
}

export async function updateRecruitingFirm(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid recruiting firm ID" } });
    return;
  }
  const parsed = patchRecruitingFirmSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e: ZodIssue) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  try {
    const row = await recruitingFirmsRepo.updateRecruitingFirm(id, parsed.data);
    if (!row) {
      res.status(404).json({ error: { message: "Recruiting firm not found" } });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to update recruiting firm");
    res.status(500).json({ error: { message: "Failed to update recruiting firm" } });
  }
}

export async function deleteRecruitingFirm(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (id === null) {
    res.status(400).json({ error: { message: "Invalid recruiting firm ID" } });
    return;
  }
  try {
    const deleted = await recruitingFirmsRepo.deleteRecruitingFirm(id);
    if (!deleted) {
      res.status(404).json({ error: { message: "Recruiting firm not found" } });
      return;
    }
    res.status(204).send();
  } catch (err) {
    logger.error({ err }, "Failed to delete recruiting firm");
    res.status(500).json({ error: { message: "Failed to delete recruiting firm" } });
  }
}
