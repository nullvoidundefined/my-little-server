import crypto from "node:crypto";

import bcrypt from "bcrypt";

import { SESSION_TTL_MS } from "app/constants/session.js";
import db from "app/db/pool.js";
import type { User } from "app/schemas/auth.js";

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

export async function findUserById(id: string): Promise<User | null> {
  const result = await db.query<User>(
    "SELECT id, email, created_at, updated_at FROM users WHERE id = $1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string): Promise<string> {
  const id = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.query("INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)", [
    id,
    userId,
    expiresAt,
  ]);
  return id;
}

/** Returns the user for a valid session in one query (sessions JOIN users). */
export async function getSessionWithUser(sessionId: string): Promise<User | null> {
  const result = await db.query<User>(
    `SELECT u.id, u.email, u.created_at, u.updated_at
     FROM sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId],
  );
  return result.rows[0] ?? null;
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const result = await db.query("DELETE FROM sessions WHERE id = $1 RETURNING id", [sessionId]);
  return (result.rowCount ?? 0) > 0;
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  await db.query("DELETE FROM sessions WHERE user_id = $1", [userId]);
}
