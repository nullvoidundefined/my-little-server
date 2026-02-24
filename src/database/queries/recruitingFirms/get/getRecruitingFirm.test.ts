import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { getRecruitingFirm } from "./getRecruitingFirm.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.get("/recruiting-firms/:id", getRecruitingFirm);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("getRecruitingFirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when id is invalid", async () => {
    const res = await request(app).get("/recruiting-firms/abc");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: { message: "Invalid recruiting firm ID" } });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 200 with recruiting firm when found", async () => {
    const row = {
      id: 1,
      name: "Acme Recruiting",
      website: "https://acme.example.com",
      linkedin_url: null,
      notes: null,
      created_at: new Date("2025-01-01"),
      updated_at: new Date("2025-01-02"),
    };
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [row],
    } as QueryResult);

    const res = await request(app).get("/recruiting-firms/1");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: 1,
      name: "Acme Recruiting",
      website: "https://acme.example.com",
    });
    expect(res.body.created_at).toBe(row.created_at.toISOString());
    expect(res.body.updated_at).toBe(row.updated_at.toISOString());
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id, name, website, linkedin_url, notes, created_at, updated_at FROM recruiting_firms WHERE id = $1",
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

    const res = await request(app).get("/recruiting-firms/999");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { message: "Recruiting firm not found" } });
  });

  it("returns 500 when db.query fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/recruiting-firms/1");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: "Failed to fetch recruiting firm" } });
  });
});
