import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { deleteRecruitingFirm } from "./deleteRecruitingFirm.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.delete("/recruiting-firms/:id", deleteRecruitingFirm);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("deleteRecruitingFirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when id is invalid", async () => {
    const res = await request(app).delete("/recruiting-firms/abc");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid recruiting firm ID" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 204 when recruiting firm is deleted", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [{ id: 1 }],
    } as QueryResult);

    const res = await request(app).delete("/recruiting-firms/1");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
    expect(mockQuery).toHaveBeenCalledWith(
      "DELETE FROM recruiting_firms WHERE id = $1 RETURNING id",
      [1],
    );
  });

  it("returns 404 when recruiting firm not found", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 0,
      rows: [],
    } as QueryResult);

    const res = await request(app).delete("/recruiting-firms/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Recruiting firm not found" });
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).delete("/recruiting-firms/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to delete recruiting firm" });
    consoleSpy.mockRestore();
  });
});

