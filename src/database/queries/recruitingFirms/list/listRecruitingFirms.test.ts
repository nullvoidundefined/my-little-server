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
        updated_at: new Date("2025-01-02"),
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
    const row = rows[0];
    expect(row).toBeDefined();
    expect(res.body).toEqual([
      {
        ...row!,
        created_at: row!.created_at.toISOString(),
        updated_at: row!.updated_at.toISOString(),
      },
    ]);
    expect(mockQuery).toHaveBeenCalledWith(
      "SELECT id, name, website, linkedin_url, notes, created_at, updated_at FROM recruiting_firms ORDER BY id LIMIT $1 OFFSET $2",
      [50, 0],
    );
  });

  it("returns 500 when db.query fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/recruiting-firms");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: "Failed to fetch recruiting firms" } });
  });
});
