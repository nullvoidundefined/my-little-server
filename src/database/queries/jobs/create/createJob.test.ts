import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { createJob } from "./createJob.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.post("/jobs", createJob);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("createJob", () => {
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

    const res = await request(app).post("/jobs").send({ company: "Acme", role: "Engineer" });

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

    const res = await request(app).post("/jobs").send({ company: "Acme", role: "Engineer" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create job" });
    consoleSpy.mockRestore();
  });
});
