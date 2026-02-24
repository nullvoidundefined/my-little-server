import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { updateJob } from "./updateJob.js";

vi.mock("../../../../db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.patch("/jobs/:id", updateJob);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("updateJob", () => {
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

    const res = await request(app).patch("/jobs/1").send({ status: "interviewing" });

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
    const res = await request(app).patch("/jobs/abc").send({ status: "applied" });

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

    const res = await request(app).patch("/jobs/999").send({ status: "applied" });

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
