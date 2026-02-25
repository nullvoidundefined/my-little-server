import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as recruitersHandlers from "app/handlers/recruiters/recruiters.js";
import * as recruitersRepo from "app/repositories/recruiters/recruiters.js";
import type { Recruiter } from "app/types/recruiter.js";
import { expectError, expectListResponse } from "app/utils/tests/responseHelpers.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/repositories/recruiters/recruiters.js");
vi.mock("app/utils/logs/logger.js", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const app = express();
app.use(express.json());
app.get("/recruiters", recruitersHandlers.listRecruiters);
app.get("/recruiters/:id", recruitersHandlers.getRecruiter);
app.post("/recruiters", recruitersHandlers.createRecruiter);
app.patch("/recruiters/:id", recruitersHandlers.updateRecruiter);
app.delete("/recruiters/:id", recruitersHandlers.deleteRecruiter);

describe("recruiters handlers", () => {
  const id = uuid();
  const firmId = uuid();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRecruiters", () => {
    it("returns 200 with recruiters from repo", async () => {
      const rows = [
        {
          created_at: new Date("2025-01-01"),
          email: "jane@example.com",
          firm_id: null,
          id,
          linkedin_url: null,
          name: "Jane",
          notes: null,
          phone: null,
          title: null,
          updated_at: new Date("2025-01-02"),
        },
      ];
      vi.mocked(recruitersRepo.listRecruiters).mockResolvedValueOnce(
        rows as unknown as Recruiter[],
      );
      vi.mocked(recruitersRepo.getRecruitersTotalCount).mockResolvedValueOnce(1);

      const res = await request(app).get("/recruiters");

      expectListResponse(res, rows, 1);
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
        id,
        name: "Jane",
        email: "jane@example.com",
        phone: null,
        title: null,
        linkedin_url: null,
        firm_id: firmId,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(recruitersRepo.getRecruiterById).mockResolvedValueOnce(row as unknown as Recruiter);
      const res = await request(app).get(`/recruiters/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Jane");
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitersRepo.getRecruiterById).mockResolvedValueOnce(null);
      const res = await request(app).get(`/recruiters/${id}`);
      expect(res.status).toBe(404);
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitersRepo.getRecruiterById).mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).get(`/recruiters/${id}`);
      expectError(res, 500, "Failed to fetch recruiter");
    });
  });

  describe("createRecruiter", () => {
    it("returns 201 with created recruiter", async () => {
      const created = {
        id,
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
    it("returns 400 when firm_id does not exist (23503)", async () => {
      const err = new Error("foreign key violation");
      (err as Error & { code: string }).code = "23503";
      vi.mocked(recruitersRepo.createRecruiter).mockRejectedValueOnce(err);
      const res = await request(app)
        .post("/recruiters")
        .send({ name: "Jane", email: "jane@example.com", firm_id: firmId });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Firm not found");
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitersRepo.createRecruiter).mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app)
        .post("/recruiters")
        .send({ name: "Jane", email: "jane@example.com" });
      expectError(res, 500, "Failed to create recruiter");
    });
  });

  describe("updateRecruiter", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).patch("/recruiters/abc").send({ name: "X" });
      expect(res.status).toBe(400);
      expect(recruitersRepo.updateRecruiter).not.toHaveBeenCalled();
    });
    it("returns 200 when updated", async () => {
      const updated = {
        id,
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
      const res = await request(app).patch(`/recruiters/${id}`).send({ name: "Jane Doe" });
      expect(res.status).toBe(200);
    });
    it("returns 400 when body invalid", async () => {
      const res = await request(app).patch(`/recruiters/${id}`).send({ name: "" });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBeDefined();
      expect(recruitersRepo.updateRecruiter).not.toHaveBeenCalled();
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitersRepo.updateRecruiter).mockResolvedValueOnce(null);
      const res = await request(app).patch(`/recruiters/${id}`).send({ name: "X" });
      expect(res.status).toBe(404);
    });
    it("returns 400 when firm_id does not exist (23503)", async () => {
      const err = new Error("foreign key violation");
      (err as Error & { code: string }).code = "23503";
      vi.mocked(recruitersRepo.updateRecruiter).mockRejectedValueOnce(err);
      const res = await request(app).patch(`/recruiters/${id}`).send({ firm_id: firmId });
      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe("Firm not found");
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitersRepo.updateRecruiter).mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).patch(`/recruiters/${id}`).send({ name: "Jane Doe" });
      expectError(res, 500, "Failed to update recruiter");
    });
  });

  describe("deleteRecruiter", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).delete("/recruiters/abc");
      expect(res.status).toBe(400);
      expect(recruitersRepo.deleteRecruiter).not.toHaveBeenCalled();
    });
    it("returns 204 when deleted", async () => {
      vi.mocked(recruitersRepo.deleteRecruiter).mockResolvedValueOnce(true);
      const res = await request(app).delete(`/recruiters/${id}`);
      expect(res.status).toBe(204);
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitersRepo.deleteRecruiter).mockResolvedValueOnce(false);
      const res = await request(app).delete(`/recruiters/${id}`);
      expect(res.status).toBe(404);
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitersRepo.deleteRecruiter).mockRejectedValueOnce(new Error("DB error"));
      const res = await request(app).delete(`/recruiters/${id}`);
      expectError(res, 500, "Failed to delete recruiter");
    });
  });
});
