import express from "express";
import type { QueryResult } from "pg";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import db from "../../../utilities/connectionPool/connectionPool.js";
import { deleteJob } from "./deleteJob.js";

vi.mock("../../../../db.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.delete("/jobs/:id", deleteJob);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("deleteJob", () => {
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
