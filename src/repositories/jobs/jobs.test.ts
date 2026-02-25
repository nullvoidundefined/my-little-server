import { beforeEach, describe, expect, it, vi } from "vitest";

import { query } from "app/db/pool.js";
import * as jobsRepo from "app/repositories/jobs/jobs.js";
import { mockResult } from "app/utils/tests/mockResult.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/db/pool.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);
const userId = uuid();

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
    mockQuery.mockResolvedValueOnce(mockResult([row]));

    const result = await jobsRepo.createJob(userId, {
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-01",
    });

    expect(result).toEqual(row);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO jobs"), [
      userId,
      "Acme",
      "Engineer",
      "applied",
      "2025-01-01",
      null,
    ]);
  });

  it("createJob throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([], 0));
    await expect(
      jobsRepo.createJob(userId, { company: "Acme", role: "Engineer", status: "applied" }),
    ).rejects.toThrow("Insert returned no row");
  });

  it("createJob passes null for optional status, applied_date, notes", async () => {
    mockQuery.mockResolvedValueOnce(
      mockResult([
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
      ]),
    );
    await jobsRepo.createJob(userId, { company: "Acme", role: "Engineer" });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
      userId,
      "Acme",
      "Engineer",
      null,
      null,
      null,
    ]);
  });

  it("getJobsTotalCount returns count", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([{ count: "42" }]));
    const result = await jobsRepo.getJobsTotalCount(userId);
    expect(result).toBe(42);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT COUNT(*)::int AS count FROM jobs WHERE user_id = $1",
      [userId],
    );
  });

  it("getJobsTotalCount returns 0 when no rows", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([]));
    const result = await jobsRepo.getJobsTotalCount(userId);
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
    mockQuery.mockResolvedValueOnce(mockResult(rows));

    const result = await jobsRepo.listJobs(userId, 10, 0);

    expect(result).toEqual(rows);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [userId, 10, 0]);
  });

  const id = uuid();

  it("getJobById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([]));
    const result = await jobsRepo.getJobById(userId, id);
    expect(result).toBeNull();
  });

  it("updateJob returns null when no row updated", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([]));
    const result = await jobsRepo.updateJob(userId, id, { status: "applied" });
    expect(result).toBeNull();
  });

  it("updateJob returns null when no fields provided", async () => {
    const result = await jobsRepo.updateJob(userId, id, {});
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
    mockQuery.mockResolvedValueOnce(mockResult([row]));
    const result = await jobsRepo.updateJob(userId, id, { status: "interviewing" });
    expect(result).toEqual(row);
  });

  it("deleteJob returns true when row deleted", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([], 1));
    const result = await jobsRepo.deleteJob(userId, id);
    expect(result).toBe(true);
  });

  it("deleteJob returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([], 0));
    const result = await jobsRepo.deleteJob(userId, id);
    expect(result).toBe(false);
  });
});
