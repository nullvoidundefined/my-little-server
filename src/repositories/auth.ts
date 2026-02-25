import crypto from "node:crypto";

import bcrypt from "bcrypt";

import { SESSION_TTL_MS } from "../constants/session.js";
import db from "../db/pool.js";
import type { User } from "../schemas/auth.js";

const SALT_ROUNDS = 10;

export async function createUser(email: string, password: string): Promise<User> {
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.query<User & { password_hash: string }>(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at, updated_at",
    [email.toLowerCase().trim(), password_hash],
  );
  const row = result.rows[0];
  if (!row) throw new Error("Insert returned no row");
  return row;
}

export async function findUserByEmail(
  email: string,
): Promise<(User & { password_hash: string }) | null> {
  const result = await db.query<User & { password_hash: string }>(
    "SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1",
    [email.toLowerCase().trim()],
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const result = await db.query<User>(
    "SELECT id, email, created_at, updated_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: number): Promise<string> {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [
    id,
    userId,
    expiresAt,
  ]);
  return id;
}

export async function getSession(sessionId: string): Promise<{ user_id: number } | null> {
  const result = await db.query<{ user_id: number }>(
    "SELECT user_id FROM sessions WHERE id = $1 AND expires_at > NOW()",
    [sessionId],
  );
  return result.rows[0] ?? null;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await db.query("DELETE FROM sessions WHERE id = $1 RETURNING id", [sessionId]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteSessionsForUser(userId: number): Promise<void> {
  await db.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}
