import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { listRecruitingFirms } from "./listRecruitingFirms.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.get("/recruiting-firms", listRecruitingFirms);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("listRecruitingFirms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all recruiting firms ordered by id", async () => {
    const rows = [
      {
        id: 1,
        name: "Acme Recruiting",
        website: "https://acme.example.com",
        linkedin_url: "https://linkedin.com/company/acme",
        notes: "Top firm",
        created_at: new Date("2025-01-01"),
      },
    ];

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows,
    } as QueryResult);

    const res = await request(app).get("/recruiting-firms");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {
        ...rows[0],
        created_at: rows[0].created_at.toISOString(),
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id, name, website, linkedin_url, notes, created_at FROM recruiting_firms ORDER BY id",
    );
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/recruiting-firms");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to fetch recruiting firms" });
    consoleSpy.mockRestore();
  });
});
