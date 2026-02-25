import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as recruitingFirmsRepo from "../../repositories/recruitingFirms.js";
import type { RecruitingFirm } from "../../types/recruitingFirm.js";

import * as recruitingFirmsHandlers from "./recruitingFirms.js";

vi.mock("../../repositories/recruitingFirms.js");
vi.mock("../../config/loggerConfig.js", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const app = express();
app.use(express.json());
app.get("/recruiting-firms", recruitingFirmsHandlers.listRecruitingFirms);
app.get("/recruiting-firms/:id", recruitingFirmsHandlers.getRecruitingFirm);
app.post("/recruiting-firms", recruitingFirmsHandlers.createRecruitingFirm);
app.patch("/recruiting-firms/:id", recruitingFirmsHandlers.updateRecruitingFirm);
app.delete("/recruiting-firms/:id", recruitingFirmsHandlers.deleteRecruitingFirm);

describe("recruitingFirms handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listRecruitingFirms", () => {
    it("returns 200 with firms from repo", async () => {
      const rows = [
        {
          id: 1,
          name: "Acme",
          website: null,
          linkedin_url: null,
          notes: null,
          created_at: new Date("2025-01-01"),
          updated_at: new Date("2025-01-02"),
        },
      ];
      vi.mocked(recruitingFirmsRepo.listRecruitingFirms).mockResolvedValueOnce(
        rows as unknown as RecruitingFirm[],
      );
      vi.mocked(recruitingFirmsRepo.getRecruitingFirmsTotalCount).mockResolvedValueOnce(1);
      const res = await request(app).get("/recruiting-firms");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: JSON.parse(JSON.stringify(rows)),
        meta: { total: 1, limit: 50, offset: 0 },
      });
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitingFirmsRepo.listRecruitingFirms).mockRejectedValueOnce(
        new Error("DB error"),
      );
      const res = await request(app).get("/recruiting-firms");
      expect(res.status).toBe(500);
    });
  });

  describe("getRecruitingFirm", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).get("/recruiting-firms/abc");
      expect(res.status).toBe(400);
    });
    it("returns 200 when found", async () => {
      const row = {
        id: 1,
        name: "Acme",
        website: "https://acme.com",
        linkedin_url: null,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(recruitingFirmsRepo.getRecruitingFirmById).mockResolvedValueOnce(
        row as unknown as RecruitingFirm,
      );
      const res = await request(app).get("/recruiting-firms/1");
      expect(res.status).toBe(200);
      expect(res.body.name).toBe("Acme");
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitingFirmsRepo.getRecruitingFirmById).mockResolvedValueOnce(null);
      const res = await request(app).get("/recruiting-firms/999");
      expect(res.status).toBe(404);
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitingFirmsRepo.getRecruitingFirmById).mockRejectedValueOnce(
        new Error("DB error"),
      );
      const res = await request(app).get("/recruiting-firms/1");
      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe("Failed to fetch recruiting firm");
    });
  });

  describe("createRecruitingFirm", () => {
    it("returns 201 with created firm", async () => {
      const created = {
        id: 1,
        name: "Acme",
        website: null,
        linkedin_url: null,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-01"),
      };
      vi.mocked(recruitingFirmsRepo.createRecruitingFirm).mockResolvedValueOnce(
        created as unknown as RecruitingFirm,
      );
      const res = await request(app).post("/recruiting-firms").send({ name: "Acme" });
      expect(res.status).toBe(201);
      expect(recruitingFirmsRepo.createRecruitingFirm).toHaveBeenCalled();
    });
    it("returns 400 when body invalid", async () => {
      const res = await request(app).post("/recruiting-firms").send({});
      expect(res.status).toBe(400);
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitingFirmsRepo.createRecruitingFirm).mockRejectedValueOnce(
        new Error("DB error"),
      );
      const res = await request(app).post("/recruiting-firms").send({ name: "Acme" });
      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe("Failed to create recruiting firm");
    });
  });

  describe("updateRecruitingFirm", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).patch("/recruiting-firms/abc").send({ name: "X" });
      expect(res.status).toBe(400);
      expect(recruitingFirmsRepo.updateRecruitingFirm).not.toHaveBeenCalled();
    });
    it("returns 200 when updated", async () => {
      const updated = {
        id: 1,
        name: "Acme Recruiting",
        website: null,
        linkedin_url: null,
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(recruitingFirmsRepo.updateRecruitingFirm).mockResolvedValueOnce(
        updated as unknown as RecruitingFirm,
      );
      const res = await request(app).patch("/recruiting-firms/1").send({ name: "Acme Recruiting" });
      expect(res.status).toBe(200);
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitingFirmsRepo.updateRecruitingFirm).mockResolvedValueOnce(null);
      const res = await request(app).patch("/recruiting-firms/999").send({ name: "X" });
      expect(res.status).toBe(404);
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitingFirmsRepo.updateRecruitingFirm).mockRejectedValueOnce(
        new Error("DB error"),
      );
      const res = await request(app).patch("/recruiting-firms/1").send({ name: "Acme Recruiting" });
      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe("Failed to update recruiting firm");
    });
  });

  describe("deleteRecruitingFirm", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).delete("/recruiting-firms/abc");
      expect(res.status).toBe(400);
      expect(recruitingFirmsRepo.deleteRecruitingFirm).not.toHaveBeenCalled();
    });
    it("returns 204 when deleted", async () => {
      vi.mocked(recruitingFirmsRepo.deleteRecruitingFirm).mockResolvedValueOnce(true);
      const res = await request(app).delete("/recruiting-firms/1");
      expect(res.status).toBe(204);
    });
    it("returns 404 when not found", async () => {
      vi.mocked(recruitingFirmsRepo.deleteRecruitingFirm).mockResolvedValueOnce(false);
      const res = await request(app).delete("/recruiting-firms/999");
      expect(res.status).toBe(404);
    });
    it("returns 500 when repo throws", async () => {
      vi.mocked(recruitingFirmsRepo.deleteRecruitingFirm).mockRejectedValueOnce(
        new Error("DB error"),
      );
      const res = await request(app).delete("/recruiting-firms/1");
      expect(res.status).toBe(500);
      expect(res.body.error.message).toBe("Failed to delete recruiting firm");
    });
  });
});
