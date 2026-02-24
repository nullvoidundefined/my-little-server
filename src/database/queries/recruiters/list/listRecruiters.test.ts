import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { listRecruiters } from "./listRecruiters.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.get("/recruiters", listRecruiters);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("listRecruiters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all recruiters ordered by id", async () => {
    const rows = [
      {
        id: 1,
        name: "Jane Doe",
        email: "jane@example.com",
        phone: "1234567890",
        title: "Senior Recruiter",
        linkedin_url: "https://linkedin.com/in/jane",
        firm_id: 42,
        notes: "Top recruiter",
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

    const res = await request(app).get("/recruiters");

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
      "SELECT id, name, email, phone, title, linkedin_url, firm_id, notes, created_at, updated_at FROM recruiters ORDER BY id LIMIT $1 OFFSET $2",
      [50, 0],
    );
  });

  it("returns 500 when db.query fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).get("/recruiters");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: "Failed to fetch recruiters" } });
  });
});
