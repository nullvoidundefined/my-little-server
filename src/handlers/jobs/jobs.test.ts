import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as jobsHandlers from "app/handlers/jobs/jobs.js";
import * as jobsRepo from "app/repositories/jobs/jobs.js";
import type { Job } from "app/types/job.js";
import { expectError, expectListResponse } from "app/utils/tests/responseHelpers.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/repositories/jobs/jobs.js");
vi.mock("app/config/loggerConfig.js", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const app = express();
app.use(express.json());
app.get("/jobs", jobsHandlers.listJobs);
app.get("/jobs/:id", jobsHandlers.getJob);
app.post("/jobs", jobsHandlers.createJob);
app.patch("/jobs/:id", jobsHandlers.updateJob);
app.delete("/jobs/:id", jobsHandlers.deleteJob);

describe("jobs handlers", () => {
  const id = uuid();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listJobs", () => {
    it("returns 200 with jobs from repo", async () => {
      const rows = [
        {
          id,
          company: "Acme",
          role: "Engineer",
          status: "applied",
          applied_date: "2025-01-01",
          notes: null,
          created_at: new Date("2025-01-01"),
          updated_at: new Date("2025-01-02"),
        },
      ];
      vi.mocked(jobsRepo.listJobs).mockResolvedValueOnce(rows as unknown as Job[]);
      vi.mocked(jobsRepo.getJobsTotalCount).mockResolvedValueOnce(1);

      const res = await request(app).get("/jobs");

      expectListResponse(res, rows, 1);
      expect(jobsRepo.listJobs).toHaveBeenCalledWith(50, 0);
    });

    it("returns 500 when repo throws", async () => {
      vi.mocked(jobsRepo.listJobs).mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get("/jobs");

      expectError(res, 500, "Failed to fetch jobs");
    });
  });

  describe("getJob", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).get("/jobs/abc");
      expect(res.status).toBe(400);
      expect(jobsRepo.getJobById).not.toHaveBeenCalled();
    });

    it("returns 200 with job when found", async () => {
      const row = {
        id,
        company: "Acme",
        role: "Engineer",
        status: "applied",
        applied_date: "2025-01-01",
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(jobsRepo.getJobById).mockResolvedValueOnce(row as unknown as Job);

      const res = await request(app).get(`/jobs/${id}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id, company: "Acme" });
      expect(jobsRepo.getJobById).toHaveBeenCalledWith(id);
    });

    it("returns 404 when not found", async () => {
      vi.mocked(jobsRepo.getJobById).mockResolvedValueOnce(null);

      const res = await request(app).get(`/jobs/${id}`);

      expectError(res, 404, "Job not found");
    });

    it("returns 500 when repo throws", async () => {
      vi.mocked(jobsRepo.getJobById).mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).get(`/jobs/${id}`);

      expectError(res, 500, "Failed to fetch job");
    });
  });

  describe("createJob", () => {
    it("returns 201 with created job", async () => {
      const created = {
        id,
        company: "Acme",
        role: "Engineer",
        status: "applied",
        applied_date: "2025-01-01",
        notes: "Great",
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-01"),
      };
      vi.mocked(jobsRepo.createJob).mockResolvedValueOnce(created as unknown as Job);

      const res = await request(app)
        .post("/jobs")
        .send({ company: "Acme", role: "Engineer", status: "applied" });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ company: "Acme", role: "Engineer" });
      expect(jobsRepo.createJob).toHaveBeenCalledWith(
        expect.objectContaining({ company: "Acme", role: "Engineer" }),
      );
    });

    it("returns 400 when body invalid", async () => {
      const res = await request(app).post("/jobs").send({ role: "Engineer" });
      expect(res.status).toBe(400);
      expect(jobsRepo.createJob).not.toHaveBeenCalled();
    });

    it("returns 500 when repo throws", async () => {
      vi.mocked(jobsRepo.createJob).mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).post("/jobs").send({ company: "Acme", role: "Engineer" });

      expectError(res, 500, "Failed to create job");
    });
  });

  describe("updateJob", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).patch("/jobs/abc").send({ status: "applied" });
      expect(res.status).toBe(400);
      expect(jobsRepo.updateJob).not.toHaveBeenCalled();
    });

    it("returns 200 with updated job", async () => {
      const updated = {
        id,
        company: "Acme",
        role: "Engineer",
        status: "interviewing",
        applied_date: "2025-01-01",
        notes: null,
        created_at: new Date("2025-01-01"),
        updated_at: new Date("2025-01-02"),
      };
      vi.mocked(jobsRepo.updateJob).mockResolvedValueOnce(updated as unknown as Job);

      const res = await request(app).patch(`/jobs/${id}`).send({ status: "interviewing" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("interviewing");
      expect(jobsRepo.updateJob).toHaveBeenCalledWith(id, { status: "interviewing" });
    });

    it("returns 404 when not found", async () => {
      vi.mocked(jobsRepo.updateJob).mockResolvedValueOnce(null);

      const res = await request(app).patch(`/jobs/${id}`).send({ status: "applied" });

      expectError(res, 404, "Job not found");
    });

    it("returns 500 when repo throws", async () => {
      vi.mocked(jobsRepo.updateJob).mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).patch(`/jobs/${id}`).send({ status: "interviewing" });

      expectError(res, 500, "Failed to update job");
    });

    it("returns 400 when body invalid", async () => {
      const res = await request(app).patch(`/jobs/${id}`).send({ company: "" });
      expect(res.status).toBe(400);
      expect(jobsRepo.updateJob).not.toHaveBeenCalled();
    });
  });

  describe("deleteJob", () => {
    it("returns 400 for invalid id", async () => {
      const res = await request(app).delete("/jobs/abc");
      expect(res.status).toBe(400);
      expect(jobsRepo.deleteJob).not.toHaveBeenCalled();
    });

    it("returns 204 when deleted", async () => {
      vi.mocked(jobsRepo.deleteJob).mockResolvedValueOnce(true);

      const res = await request(app).delete(`/jobs/${id}`);

      expect(res.status).toBe(204);
      expect(jobsRepo.deleteJob).toHaveBeenCalledWith(id);
    });

    it("returns 404 when not found", async () => {
      vi.mocked(jobsRepo.deleteJob).mockResolvedValueOnce(false);

      const res = await request(app).delete(`/jobs/${id}`);

      expectError(res, 404, "Job not found");
    });

    it("returns 500 when repo throws", async () => {
      vi.mocked(jobsRepo.deleteJob).mockRejectedValueOnce(new Error("DB error"));

      const res = await request(app).delete(`/jobs/${id}`);

      expectError(res, 500, "Failed to delete job");
    });
  });
});
