import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "app/db/pool.js";
import * as jobsRepo from "app/repositories/jobs/jobs.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/db/pool.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = vi.mocked(db.query);

describe("jobs repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createJob inserts and returns row", async () => {
    const row = {
      id: "550e8400-e29b-41d4-a716-446655440000",
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
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO jobs"), [
      "Acme",
      "Engineer",
      "applied",
      "2025-01-01",
      null,
    ]);
  });

  it("createJob throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(
      jobsRepo.createJob({ company: "Acme", role: "Engineer", status: "applied" }),
    ).rejects.toThrow("Insert returned no row");
  });

  it("createJob passes null for optional status, applied_date, notes", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          company: "Acme",
          role: "Engineer",
          status: null,
          applied_date: null,
          notes: null,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    } as never);
    await jobsRepo.createJob({ company: "Acme", role: "Engineer" });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
      "Acme",
      "Engineer",
      null,
      null,
      null,
    ]);
  });

  it("getJobsTotalCount returns count", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: "42" }] } as never);
    const result = await jobsRepo.getJobsTotalCount();
    expect(result).toBe(42);
    expect(mockQuery).toHaveBeenCalledWith("SELECT COUNT(*)::int AS count FROM jobs");
  });

  it("getJobsTotalCount returns 0 when no rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await jobsRepo.getJobsTotalCount();
    expect(result).toBe(0);
  });

  it("listJobs returns rows", async () => {
    const rows = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
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

  const id = uuid();

  it("getJobById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await jobsRepo.getJobById(id);
    expect(result).toBeNull();
  });

  it("updateJob returns null when no row updated", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await jobsRepo.updateJob(id, { status: "applied" });
    expect(result).toBeNull();
  });

  it("updateJob returns null when no fields provided", async () => {
    const result = await jobsRepo.updateJob(id, {});
    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("updateJob returns row when updated", async () => {
    const row = {
      id,
      company: "Acme",
      role: "Engineer",
      status: "interviewing",
      applied_date: "2025-01-01",
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await jobsRepo.updateJob(id, { status: "interviewing" });
    expect(result).toEqual(row);
  });

  it("deleteJob returns true when row deleted", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 } as never);
    const result = await jobsRepo.deleteJob(id);
    expect(result).toBe(true);
  });

  it("deleteJob returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await jobsRepo.deleteJob(id);
    expect(result).toBe(false);
  });
});
