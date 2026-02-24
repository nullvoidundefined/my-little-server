import express from "express";
import type { QueryResult } from "pg";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../../../utilities/connectionPool/connectionPool.js";

import { createRecruitingFirm } from "./createRecruitingFirm.js";

vi.mock("../../../utilities/connectionPool/connectionPool.js", () => ({
  default: {
    query: vi.fn(),
  },
}));

const app = express();
app.use(express.json());
app.post("/recruiting-firms", createRecruitingFirm);

const mockQuery = vi.mocked(db.query) as ReturnType<typeof vi.fn> & {
  mockResolvedValueOnce(value: QueryResult): ReturnType<typeof vi.fn>;
};

describe("createRecruitingFirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a recruiting firm with full body", async () => {
    const newFirm = {
      id: 1,
      name: "Acme Recruiting",
      website: "https://acme.example.com",
      linkedin_url: "https://linkedin.com/company/acme",
      notes: "Top firm",
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [newFirm],
    } as QueryResult);

    const body = {
      name: "Acme Recruiting",
      website: "https://acme.example.com",
      linkedin_url: "https://linkedin.com/company/acme",
      notes: "Top firm",
    };

    const res = await request(app).post("/recruiting-firms").send(body);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(body);
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO recruiting_firms (name, website, linkedin_url, notes) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        "Acme Recruiting",
        "https://acme.example.com",
        "https://linkedin.com/company/acme",
        "Top firm",
      ],
    );
  });

  it("creates a recruiting firm with only required field (name)", async () => {
    const newFirm = {
      id: 1,
      name: "Acme Recruiting",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date("2025-01-01"),
    };

    mockQuery.mockResolvedValueOnce({
      command: "",
      fields: [],
      oid: 0,
      rowCount: 1,
      rows: [newFirm],
    } as QueryResult);

    const res = await request(app).post("/recruiting-firms").send({ name: "Acme Recruiting" });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: "Acme Recruiting" });
    expect(mockQuery).toHaveBeenCalledWith(
      "INSERT INTO recruiting_firms (name, website, linkedin_url, notes) VALUES ($1, $2, $3, $4) RETURNING *",
      ["Acme Recruiting", null, null, null],
    );
  });

  it("returns 400 when name is missing", async () => {
    const res = await request(app).post("/recruiting-firms").send({});

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBeDefined();
    expect(String(res.body.error.message)).toContain("Invalid input");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when website is invalid", async () => {
    const res = await request(app)
      .post("/recruiting-firms")
      .send({ name: "Acme Recruiting", website: "not-a-url" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBeDefined();
    expect(String(res.body.error.message)).toContain("website must be a valid URL");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 400 when linkedin_url is invalid", async () => {
    const res = await request(app)
      .post("/recruiting-firms")
      .send({ name: "Acme Recruiting", linkedin_url: "not-a-url" });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBeDefined();
    expect(String(res.body.error.message)).toContain("linkedin_url must be a valid URL");
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("returns 500 when db.query fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app)
      .post("/recruiting-firms")
      .send({ name: "Acme Recruiting", website: "https://acme.example.com" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: "Failed to create recruiting firm" } });
  });
});
