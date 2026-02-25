import type { Request, Response, NextFunction } from "express";

import * as authRepo from "../repositories/auth.js";

const SESSION_COOKIE_NAME = "sid";

export async function loadSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (!token || typeof token !== "string") {
    next();
    return;
  }
  try {
    const session = await authRepo.getSession(token);
    if (!session) {
      next();
      return;
    }
    const user = await authRepo.findUserById(session.user_id);
    if (user) req.user = user;
  } catch (err) {
    next(err);
    return;
  }
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ error: { message: "Authentication required" } });
    return;
  }
  next();
}

export { SESSION_COOKIE_NAME };
