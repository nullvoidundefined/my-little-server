import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { updateRecruiter } from "./updateRecruiter.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.patch("/recruiters/:id", updateRecruiter);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("updateRecruiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates only provided fields", async () => {
    const updated = {
      id: 1,
      name: "Jane Doe",
      email: "jane.new@example.com",
      phone: "1234567890",
      title: "Senior Recruiter",
      linkedin_url: "https://linkedin.com/in/jane",
      firm_id: 42,
      notes: "Updated",
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [updated],
    } as QueryResult);

    const res = await request(app).patch("/recruiters/1").send({ email: "jane.new@example.com" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: 1, email: "jane.new@example.com" });
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE recruiters SET email = $1 WHERE id = $2 RETURNING *",
      ["jane.new@example.com", 1],
    );
  });

  it("updates multiple fields when provided", async () => {
    const updated = {
      id: 1,
      name: "Jane Doe",
      email: "jane.new@example.com",
      phone: "1234567890",
      title: "Lead Recruiter",
      linkedin_url: "https://linkedin.com/in/jane",
      firm_id: 42,
      notes: "Updated",
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [updated],
    } as QueryResult);

    const res = await request(app).patch("/recruiters/1").send({
      email: "jane.new@example.com",
      name: "Jane Doe",
      title: "Lead Recruiter",
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      email: "jane.new@example.com",
      name: "Jane Doe",
      title: "Lead Recruiter",
    });
    expect(mockQuery).toHaveBeenCalledWith(
      "UPDATE recruiters SET email = $1, name = $2, title = $3 WHERE id = $4 RETURNING *",
      ["jane.new@example.com", "Jane Doe", "Lead Recruiter", 1],
    );
  });

  it("returns 400 when no fields to update", async () => {
    const res = await request(app).patch("/recruiters/1").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("At least one field is required");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when id is invalid", async () => {
    const res = await request(app).patch("/recruiters/abc").send({ email: "test@example.com" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: "Invalid recruiter ID" });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when provided field fails validation", async () => {
    const res = await request(app).patch("/recruiters/1").send({ email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toContain("email must be valid");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 404 when recruiter not found", async () => {
    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 0,
      rows: [],
    } as QueryResult);

    const res = await request(app).patch("/recruiters/999").send({ email: "jane.new@example.com" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Recruiter not found" });
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).patch("/recruiters/1").send({ email: "jane.new@example.com" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to update recruiter" });
    consoleSpy.mockRestore();
  });
});
