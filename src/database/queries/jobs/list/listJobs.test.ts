import express from "express";
import type { QueryResult } from "pg";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { listJobs } from "./listJobs.js";

vi.mock("../../../../db.js", () => ({
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
    expect(res.body).toEqual([
      {
        ...rows[0],
        created_at: rows[0].created_at.toISOString(),
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id, company, role, status, applied_date, notes, created_at FROM jobs ORDER BY id",
    );
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/jobs");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch jobs" });
    consoleSpy.mockRestore();
  });
});
