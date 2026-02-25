import crypto from "node:crypto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "app/db/pool.js";
import * as authRepo from "app/repositories/auth/auth.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/db/pool.js", () => {
  const query = vi.fn();
  return {
    default: { query },
    withTransaction: vi.fn((fn: (client: { query: typeof query }) => Promise<unknown>) =>
      fn({ query }),
    ),
  };
});

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(() => Promise.resolve("hashed")),
    compare: vi.fn((plain: string, hash: string) =>
      Promise.resolve(hash === "hashed" && plain.length > 0),
    ),
  },
}));

const mockQuery = vi.mocked(db.query);

describe("auth repository", () => {
  const id = uuid();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createUser inserts and returns user", async () => {
    const row = {
      id,
      email: "u@example.com",
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);

    const result = await authRepo.createUser("u@example.com", "password123");

    expect(result).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO users"), [
      "u@example.com",
      "hashed",
    ]);
  });

  it("createUser throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(authRepo.createUser("u@example.com", "pwd")).rejects.toThrow(
      "Insert returned no row",
    );
  });

  it("findUserByEmail returns user when found", async () => {
    const row = {
      id: id,
      email: "u@example.com",
      password_hash: "hashed",
      created_at: new Date(),
      updated_at: null,
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await authRepo.findUserByEmail("u@example.com");

    expect(result).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), ["u@example.com"]);
  });

  it("findUserByEmail returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await authRepo.findUserByEmail("nobody@example.com");
    expect(result).toBeNull();
  });

  it("findUserById returns user when found", async () => {
    const row = {
      id: id,
      email: "u@example.com",
      created_at: new Date(),
      updated_at: null,
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await authRepo.findUserById(id);
    expect(result).toEqual(row);
  });

  it("findUserById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await authRepo.findUserById(id);
    expect(result).toBeNull();
  });

  it("verifyPassword returns true when match", async () => {
    const result = await authRepo.verifyPassword("pwd", "hashed");
    expect(result).toBe(true);
  });

  it("verifyPassword returns false when no match", async () => {
    const result = await authRepo.verifyPassword("pwd", "other");
    expect(result).toBe(false);
  });

  it("createSession inserts hash of token and returns raw token", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const result = await authRepo.createSession(id);
    expect(typeof result).toBe("string");
    expect(result).toHaveLength(64);
    const storedHash = crypto.createHash("sha256").update(result, "utf8").digest("hex");
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO sessions"), [
      storedHash,
      id,
      expect.any(Date),
    ]);
  });

  it("getSessionWithUser returns user when session valid", async () => {
    const row = {
      id: id,
      email: "u@example.com",
      created_at: new Date(),
      updated_at: null,
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await authRepo.getSessionWithUser("session-id");
    expect(result).toEqual(row);
    const expectedHash = crypto.createHash("sha256").update("session-id", "utf8").digest("hex");
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("sessions"), [expectedHash]);
  });

  it("getSessionWithUser returns null when no row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await authRepo.getSessionWithUser("bad");
    expect(result).toBeNull();
  });

  it("deleteSession returns true when deleted", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 } as never);
    const result = await authRepo.deleteSession("sid");
    expect(result).toBe(true);
    const expectedHash = crypto.createHash("sha256").update("sid", "utf8").digest("hex");
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM sessions"), [
      expectedHash,
    ]);
  });

  it("deleteSession returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await authRepo.deleteSession("sid");
    expect(result).toBe(false);
  });

  it("deleteSessionsForUser runs delete query", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 2 } as never);
    await authRepo.deleteSessionsForUser(id);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM sessions"), [id]);
  });

  it("createUserAndSession runs user and session inserts in transaction", async () => {
    const userRow = {
      id,
      email: "u@example.com",
      created_at: new Date(),
      updated_at: null,
    };
    mockQuery
      .mockResolvedValueOnce({ rows: [userRow], rowCount: 1 } as never)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as never);
    const result = await authRepo.createUserAndSession("u@example.com", "pwd");
    expect(result.user).toEqual(userRow);
    expect(typeof result.sessionId).toBe("string");
    expect(result.sessionId).toHaveLength(64);
    expect(mockQuery).toHaveBeenNthCalledWith(1, expect.stringContaining("INSERT INTO users"), [
      "u@example.com",
      "hashed",
    ]);
    expect(mockQuery).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO sessions"), [
      expect.any(String),
      id,
      expect.any(Date),
    ]);
  });
});
