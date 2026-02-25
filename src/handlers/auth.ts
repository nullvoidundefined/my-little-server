import type { Request, Response } from "express";

import { logger } from "../config/loggerConfig.js";
import * as authRepo from "../repositories/auth.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import { SESSION_COOKIE_NAME } from "../middleware/requireAuth.js";

const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const existing = await authRepo.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: { message: "Email already registered" } });
      return;
    }
    const user = await authRepo.createUser(email, password);
    const sessionId = await authRepo.createSession(user.id);
    res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
    res.status(201).json({ user: { id: user.id, email: user.email, created_at: user.created_at } });
  } catch (err) {
    logger.error({ err }, "Failed to register");
    res.status(500).json({ error: { message: "Registration failed" } });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((e) => e.message).join("; ");
    res.status(400).json({ error: { message } });
    return;
  }
  const { email, password } = parsed.data;
  try {
    const user = await authRepo.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: { message: "Invalid email or password" } });
      return;
    }
    const valid = await authRepo.verifyPassword(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: { message: "Invalid email or password" } });
      return;
    }
    const sessionId = await authRepo.createSession(user.id);
    res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
    res.json({ user: { id: user.id, email: user.email, created_at: user.created_at } });
  } catch (err) {
    logger.error({ err }, "Failed to login");
    res.status(500).json({ error: { message: "Login failed" } });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  if (token && typeof token === "string") {
    try {
      await authRepo.deleteSession(token);
    } catch (err) {
      logger.error({ err }, "Failed to delete session on logout");
    }
  }
  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: { message: "Not authenticated" } });
    return;
  }
  res.json({ user: req.user });
}
