import express from "express";
import type { QueryResult } from "pg";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import db from "../db.js";
import { jobsRouter } from "./jobs.js";

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
        id: 1,
        company: "Acme",
        role: "Engineer",
        status: "applied",
        applied_date: "2025-01-01",
        notes: null,
        created_at: new Date("2025-01-01"),
      },
    ];
    mockQuery.mockResolvedValueOnce({
      rows,
      rowCount: 1,
      command: "",
      oid: 0,
      fields: [],
    } as QueryResult);

    const res = await request(app).get("/jobs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        ...rows[0],
        created_at: rows[0].created_at.toISOString(),
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM jobs ORDER BY id");
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
      id: 1,
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-01",
      notes: "Great role",
      created_at: new Date("2025-01-01"),
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
      id: 1,
      company: "Acme",
      role: "Engineer",
      status: null,
      applied_date: null,
      notes: null,
      created_at: new Date("2025-01-01"),
    };
    mockQuery.mockResolvedValueOnce({
      rows: [newJob],
      rowCount: 1,
      command: "",
      oid: 0,
      fields: [],
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
