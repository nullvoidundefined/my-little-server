import express from "express";
import type { QueryResult } from "pg";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import db from "../db.js";
import { jobsRouter } from "./jobs.js";

/**
 * Test index — keep this in sync when adding, renaming, or removing tests.
 *
 * GET /jobs
 *   - returns all jobs ordered by id
 *   - returns 500 when db.query fails
 *
 * POST /jobs
 *   - creates a job with valid body
 *   - creates a job with only required fields (company, role)
 *   - returns 400 when company is missing
 *   - returns 400 when role is missing
 *   - returns 400 when body is empty
 *   - returns 500 when db.query fails
 *
 * PATCH /jobs/:id
 *   - updates only provided fields
 *   - updates multiple fields when provided
 *   - returns 400 when no fields to update
 *   - returns 400 when id is invalid
 *   - returns 400 when provided field fails validation
 *   - returns 404 when job not found
 *   - returns 500 when db.query fails
 *
 * DELETE /jobs/:id
 *   - returns 204 when job is deleted
 *   - returns 400 when id is invalid
 *   - returns 404 when job not found
 *   - returns 500 when db.query fails
 */

vi.mock("../db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use("/jobs", jobsRouter);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("GET /jobs", () => {
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

describe("POST /jobs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a job with valid body", async () => {
    const newJob = {
      applied_date: "2025-01-01",
      company: "Acme",
      created_at: new Date("2025-01-01"),
      id: 1,
      notes: "Great role",
      role: "Engineer",
      status: "applied",
    };
    mockQuery.mockResolvedValueOnce({
      rows: [newJob],
      rowCount: 1,
      command: "",
      oid: 0,
      fields: [],
    } as QueryResult);

    const res = await request(app).post("/jobs").send({
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-01",
      notes: "Great role",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: 1,
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-01",
      notes: "Great role",
    });
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO jobs (company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      ["Acme", "Engineer", "applied", "2025-01-01", "Great role"],
    );
  });

  it("creates a job with only required fields (company, role)", async () => {
    const newJob = {
      applied_date: null,
      company: "Acme",
      created_at: new Date("2025-01-01"),
      id: 1,
      notes: null,
      role: "Engineer",
      status: null,
    };
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [newJob],
    } as QueryResult);

    const res = await request(app)
      .post("/jobs")
      .send({ company: "Acme", role: "Engineer" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ company: "Acme", role: "Engineer" });
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO jobs (company, role, status, applied_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      ["Acme", "Engineer", null, null, null],
    );
  });

  it("returns 400 when company is missing", async () => {
    const res = await request(app).post("/jobs").send({ role: "Engineer" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error).toBe("string");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when role is missing", async () => {
    const res = await request(app).post("/jobs").send({ company: "Acme" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(typeof res.body.error).toBe("string");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/jobs").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .post("/jobs")
      .send({ company: "Acme", role: "Engineer" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create job" });
    consoleSpy.mockRestore();
  });
});

describe("PATCH /jobs/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates only provided fields", async () => {
    const updated = {
      applied_date: "2025-01-01",
      company: "Acme",
      created_at: new Date("2025-01-01"),
      id: 1,
      notes: null,
      role: "Engineer",
      status: "interviewing",
    };
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [updated],
    } as QueryResult);

    const res = await request(app)
      .patch("/jobs/1")
      .send({ status: "interviewing" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, status: "interviewing" });
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE jobs SET status = $1 WHERE id = $2 RETURNING *",
      ["interviewing", 1],
    );
  });

  it("updates multiple fields when provided", async () => {
    const updated = {
      applied_date: "2025-01-15",
      company: "Acme",
      created_at: new Date("2025-01-01"),
      id: 1,
      notes: "Call back Monday",
      role: "Senior Engineer",
      status: "offered",
    };
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [updated],
    } as QueryResult);

    const res = await request(app).patch("/jobs/1").send({
      notes: "Call back Monday",
      role: "Senior Engineer",
      status: "offered",
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      notes: "Call back Monday",
      role: "Senior Engineer",
      status: "offered",
    });
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE jobs SET role = $1, status = $2, notes = $3 WHERE id = $4 RETURNING *",
      ["Senior Engineer", "offered", "Call back Monday", 1],
    );
  });

  it("returns 400 when no fields to update", async () => {
    const res = await request(app).patch("/jobs/1").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "No fields to update" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when id is invalid", async () => {
    const res = await request(app)
      .patch("/jobs/abc")
      .send({ status: "applied" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid job ID" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when provided field fails validation", async () => {
    const res = await request(app).patch("/jobs/1").send({ company: "" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 404 when job not found", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 0,
      rows: [],
    } as QueryResult);

    const res = await request(app)
      .patch("/jobs/999")
      .send({ status: "applied" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Job not found" });
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).patch("/jobs/1").send({ status: "applied" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update job" });
    consoleSpy.mockRestore();
  });
});

describe("DELETE /jobs/:id", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when id is invalid", async () => {
    const res = await request(app).delete("/jobs/abc");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid job ID" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 204 when job is deleted", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [{ id: 1 }],
    } as QueryResult);

    const res = await request(app).delete("/jobs/1");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM jobs WHERE id = $1 RETURNING id",
      [1],
    );
  });

  it("returns 404 when job not found", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 0,
      rows: [],
    } as QueryResult);

    const res = await request(app).delete("/jobs/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Job not found" });
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).delete("/jobs/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete job" });
    consoleSpy.mockRestore();
  });
});
