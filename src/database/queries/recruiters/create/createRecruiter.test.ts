import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { createRecruiter } from "./createRecruiter.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.post("/recruiters", createRecruiter);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("createRecruiter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a recruiter with full body", async () => {
    const newRecruiter = {
      id: 1,
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "1234567890",
      title: "Senior Recruiter",
      linkedin_url: "https://linkedin.com/in/jane",
      firm_id: 42,
      notes: "Top recruiter",
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [newRecruiter],
    } as QueryResult);

    const body = {
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "1234567890",
      title: "Senior Recruiter",
      linkedin_url: "https://linkedin.com/in/jane",
      firm_id: 42,
      notes: "Top recruiter",
    };

    const res = await request(app).post("/recruiters").send(body);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(body);
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO recruiters (name, email, phone, title, linkedin_url, firm_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        "Jane Doe",
        "jane@example.com",
        "1234567890",
        "Senior Recruiter",
        "https://linkedin.com/in/jane",
        42,
        "Top recruiter",
      ],
    );
  });

  it("creates a recruiter with only required field (name)", async () => {
    const newRecruiter = {
      id: 1,
      name: "Jane Doe",
      email: null,
      phone: null,
      title: null,
      linkedin_url: null,
      firm_id: null,
      notes: null,
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [newRecruiter],
    } as QueryResult);

    const res = await request(app).post("/recruiters").send({ name: "Jane Doe" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Jane Doe" });
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO recruiters (name, email, phone, title, linkedin_url, firm_id, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      ["Jane Doe", null, null, null, null, null, null],
    );
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/recruiters").send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toContain("Invalid input");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when linkedin_url is invalid", async () => {
    const res = await request(app)
      .post("/recruiters")
      .send({ name: "Jane Doe", linkedin_url: "not-a-url" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(String(res.body.error)).toContain("linkedin_url must be a valid URL");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 500 when db.query fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .post("/recruiters")
      .send({ name: "Jane Doe", email: "jane@example.com" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Failed to create recruiter" });
    consoleSpy.mockRestore();
  });
});
