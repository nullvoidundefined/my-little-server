import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { listJobs } from "./listJobs.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.get("/jobs", listJobs);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("listJobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all jobs ordered by id", async () => {
    const rows = [
      {
        applied_date: "2025-01-01",
        company: "Acme",
        created_at: new Date("2025-01-01"),
        id: 1,
        notes: null,
        role: "Engineer",
        status: "applied",
        updated_at: new Date("2025-01-02"),
      },
    ];
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows,
    } as QueryResult);

    const res = await request(app).get("/jobs");

    expect(res.status).toBe(200);
    const row = rows[0];
    expect(row).toBeDefined();
    expect(res.body).toEqual([
      {
        ...row!,
        created_at: row!.created_at.toISOString(),
        updated_at: row!.updated_at.toISOString(),
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id, company, role, status, applied_date, notes, created_at, updated_at FROM jobs ORDER BY id LIMIT $1 OFFSET $2",
      [50, 0],
    );
  });

  it("returns 500 when db.query fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/jobs");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: "Failed to fetch jobs" } });
  });
});
