import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../db/pool.js";

import * as jobsRepo from "./jobs.js";

vi.mock("../db/pool.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = vi.mocked(db.query);

describe("jobs repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createJob inserts and returns row", async () => {
    const row = {
      id: 1,
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-01",
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);

    const result = await jobsRepo.createJob({
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-01",
    });

    expect(result).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO jobs (company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id, company, role, status, applied_date, notes, created_at, updated_at",
      ["Acme", "Engineer", "applied", "2025-01-01", null],
    );
  });

  it("getJobsTotalCount returns count", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: "42" }] } as never);
    const result = await jobsRepo.getJobsTotalCount();
    expect(result).toBe(42);
    expect(mockQuery).toHaveBeenCalledWith("SELECT COUNT(*)::int AS count FROM jobs");
  });

  it("listJobs returns rows", async () => {
    const rows = [
      {
        id: 1,
        company: "Acme",
        role: "Engineer",
        status: "applied",
        applied_date: "2025-01-01",
        notes: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];
    mockQuery.mockResolvedValueOnce({ rows } as never);

    const result = await jobsRepo.listJobs(10, 0);

    expect(result).toEqual(rows);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [10, 0]);
  });

  it("getJobById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await jobsRepo.getJobById(999);
    expect(result).toBeNull();
  });

  it("updateJob returns null when no row updated", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await jobsRepo.updateJob(999, { status: "applied" });
    expect(result).toBeNull();
  });

  it("deleteJob returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await jobsRepo.deleteJob(999);
    expect(result).toBe(false);
  });
});
