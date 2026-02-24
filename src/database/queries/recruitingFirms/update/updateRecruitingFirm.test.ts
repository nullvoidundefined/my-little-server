import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { updateRecruitingFirm } from "./updateRecruitingFirm.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.patch("/recruiting-firms/:id", updateRecruitingFirm);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("updateRecruitingFirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates only provided fields", async () => {
    const updated = {
      id: 1,
      name: "Acme Recruiting",
      website: "https://acme.example.com",
      linkedin_url: "https://linkedin.com/company/acme",
      notes: "Updated notes",
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [updated],
    } as QueryResult);

    const res = await request(app)
      .patch("/recruiting-firms/1")
      .send({ website: "https://acme.example.com" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, website: "https://acme.example.com" });
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE recruiting_firms SET website = $1 WHERE id = $2 RETURNING *",
      ["https://acme.example.com", 1],
    );
  });

  it("updates multiple fields when provided", async () => {
    const updated = {
      id: 1,
      name: "Acme Recruiting",
      website: "https://acme.example.com",
      linkedin_url: "https://linkedin.com/company/acme",
      notes: "Updated notes",
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [updated],
    } as QueryResult);

    const res = await request(app)
      .patch("/recruiting-firms/1")
      .send({
        linkedin_url: "https://linkedin.com/company/acme",
        name: "Acme Recruiting",
        notes: "Updated notes",
      });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      linkedin_url: "https://linkedin.com/company/acme",
      name: "Acme Recruiting",
      notes: "Updated notes",
    });
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE recruiting_firms SET linkedin_url = $1, name = $2, notes = $3 WHERE id = $4 RETURNING *",
      ["https://linkedin.com/company/acme", "Acme Recruiting", "Updated notes", 1],
    );
  });

  it("returns 400 when no fields to update", async () => {
    const res = await request(app).patch("/recruiting-firms/1").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "No fields to update" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when id is invalid", async () => {
    const res = await request(app)
      .patch("/recruiting-firms/abc")
      .send({ website: "https://acme.example.com" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid recruiting firm ID" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when provided field fails validation", async () => {
    const res = await request(app)
      .patch("/recruiting-firms/1")
      .send({ website: "not-a-url" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toContain("website must be a valid URL");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 404 when recruiting firm not found", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 0,
      rows: [],
    } as QueryResult);

    const res = await request(app)
      .patch("/recruiting-firms/999")
      .send({ website: "https://acme.example.com" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Recruiting firm not found" });
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .patch("/recruiting-firms/1")
      .send({ website: "https://acme.example.com" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update recruiting firm" });
    consoleSpy.mockRestore();
  });
});

