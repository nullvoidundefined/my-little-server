import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as recruitersRepo from "../../repositories/recruiters.js";
import type { Recruiter } from "../../types/recruiter.js";

import * as recruitersHandlers from "./recruiters.js";

vi.mock("../../repositories/recruiters.js");

const app = express();
app.use(express.json());
app.get("/recruiters", recruitersHandlers.listRecruiters);
app.get("/recruiters/:id", recruitersHandlers.getRecruiter);
app.post("/recruiters", recruitersHandlers.createRecruiter);
app.patch("/recruiters/:id", recruitersHandlers.updateRecruiter);
app.delete("/recruiters/:id", recruitersHandlers.deleteRecruiter);

describe("recruiters handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRecruiters", () => {
    it("returns 200 with recruiters from repo", async () => {
      const rows = [
        {
          id: 1,
          name: "Jane",
          email: "jane@example.com",
          phone: null,
          title: null,
          linkedin_url: null,
          firm_id: null,
          notes: null,
          created_at: new Date("2025-01-01"),
          updated_at: new Date("2025-01-02"),
        },
      ];
      vi.mocked(recruitersRepo.listRecruiters).mockResolvedValueOnce(
        rows as unknown as Recruiter[],
      );
      vi.mocked(recruitersRepo.getRecruitersTotalCount).mockResolvedValueOnce(1);

      const res = await request(app).get("/recruiters");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: JSON.parse(JSON.stringify(rows)),
        meta: { total: 1, limit: 50, offset: 0 },
      });
    });

    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitersRepo.listRecruiters).mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).get("/recruiters");
      expect(res.status).toBe(500);
    });
  });

  describe("getRecruiter", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).get("/recruiters/abc");
      expect(res.status).toBe(400);
    });
    it("returns 200 when found", async () => {
      const row = {
        id: 1,
        name: "Jane",
        email: "jane@example.com",
        phone: null,
        title: null,
        linkedin_url: null,
        firm_id: 1,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(recruitersRepo.getRecruiterById).mockResolvedValueOnce(row as unknown as Recruiter);
      const res = await request(app).get("/recruiters/1");
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Jane");
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitersRepo.getRecruiterById).mockResolvedValueOnce(null);
      const res = await request(app).get("/recruiters/999");
      expect(res.status).toBe(404);
    });
  });

  describe("createRecruiter", () => {
    it("returns 201 with created recruiter", async () => {
      const created = {
        id: 1,
        name: "Jane",
        email: "jane@example.com",
        phone: null,
        title: null,
        linkedin_url: null,
        firm_id: null,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-01"),
      };
      vi.mocked(recruitersRepo.createRecruiter).mockResolvedValueOnce(
        created as unknown as Recruiter,
      );
      const res = await request(app)
        .post("/recruiters")
        .send({ name: "Jane", email: "jane@example.com" });
      expect(res.status).toBe(201);
      expect(recruitersRepo.createRecruiter).toHaveBeenCalled();
    });
    it("returns 400 when body invalid", async () => {
      const res = await request(app).post("/recruiters").send({});
      expect(res.status).toBe(400);
    });
  });

  describe("updateRecruiter", () => {
    it("returns 200 when updated", async () => {
      const updated = {
        id: 1,
        name: "Jane Doe",
        email: "jane@example.com",
        phone: null,
        title: null,
        linkedin_url: null,
        firm_id: null,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(recruitersRepo.updateRecruiter).mockResolvedValueOnce(
        updated as unknown as Recruiter,
      );
      const res = await request(app).patch("/recruiters/1").send({ name: "Jane Doe" });
      expect(res.status).toBe(200);
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitersRepo.updateRecruiter).mockResolvedValueOnce(null);
      const res = await request(app).patch("/recruiters/999").send({ name: "X" });
      expect(res.status).toBe(404);
    });
  });

  describe("deleteRecruiter", () => {
    it("returns 204 when deleted", async () => {
      vi.mocked(recruitersRepo.deleteRecruiter).mockResolvedValueOnce(true);
      const res = await request(app).delete("/recruiters/1");
      expect(res.status).toBe(204);
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitersRepo.deleteRecruiter).mockResolvedValueOnce(false);
      const res = await request(app).delete("/recruiters/999");
      expect(res.status).toBe(404);
    });
  });
});
