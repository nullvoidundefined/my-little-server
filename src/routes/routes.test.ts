/**
 * Single smoke test for route wiring: verifies each path/method reaches the correct handler.
 * Handler behavior is covered by handler tests; this only guards against broken router wiring.
 */
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { authRouter } from "app/routes/auth.js";
import { jobsRouter } from "app/routes/jobs.js";
import { recruitersRouter } from "app/routes/recruiters.js";
import { recruitingFirmsRouter } from "app/routes/recruitingFirms.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/handlers/auth/auth.js", () => ({
  register: (_: express.Request, res: express.Response) => res.status(201).json({ ok: true }),
  login: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
  logout: (_: express.Request, res: express.Response) => res.status(204).send(),
  me: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
}));
vi.mock("app/handlers/jobs/jobs.js", () => ({
  listJobs: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
  getJob: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
  createJob: (_: express.Request, res: express.Response) => res.status(201).json({ ok: true }),
  updateJob: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
  deleteJob: (_: express.Request, res: express.Response) => res.status(204).send(),
}));
vi.mock("app/handlers/recruiters/recruiters.js", () => ({
  listRecruiters: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
  getRecruiter: (_: express.Request, res: express.Response) => res.status(200).json({ ok: true }),
  createRecruiter: (_: express.Request, res: express.Response) =>
    res.status(201).json({ ok: true }),
  updateRecruiter: (_: express.Request, res: express.Response) =>
    res.status(200).json({ ok: true }),
  deleteRecruiter: (_: express.Request, res: express.Response) => res.status(204).send(),
}));
vi.mock("app/handlers/recruitingFirms/recruitingFirms.js", () => ({
  listRecruitingFirms: (_: express.Request, res: express.Response) =>
    res.status(200).json({ ok: true }),
  getRecruitingFirm: (_: express.Request, res: express.Response) =>
    res.status(200).json({ ok: true }),
  createRecruitingFirm: (_: express.Request, res: express.Response) =>
    res.status(201).json({ ok: true }),
  updateRecruitingFirm: (_: express.Request, res: express.Response) =>
    res.status(200).json({ ok: true }),
  deleteRecruitingFirm: (_: express.Request, res: express.Response) => res.status(204).send(),
}));
vi.mock("app/utils/rateLimiter.js", () => ({
  authRateLimiter: (_: express.Request, __: express.Response, next: express.NextFunction) => next(),
}));

const id = uuid();
const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/jobs", jobsRouter);
app.use("/recruiters", recruitersRouter);
app.use("/recruiting-firms", recruitingFirmsRouter);

describe("route wiring", () => {
  describe("auth", () => {
    it("POST /auth/register → 201", async () => {
      const res = await request(app)
        .post("/auth/register")
        .send({ email: "a@b.com", password: "x" });
      expect(res.status).toBe(201);
    });
    it("POST /auth/login → 200", async () => {
      const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "x" });
      expect(res.status).toBe(200);
    });
    it("POST /auth/logout → 204", async () => {
      const res = await request(app).post("/auth/logout");
      expect(res.status).toBe(204);
    });
    it("GET /auth/me → 200", async () => {
      const res = await request(app).get("/auth/me");
      expect(res.status).toBe(200);
    });
  });

  describe("jobs", () => {
    it("GET /jobs → 200", async () => {
      const res = await request(app).get("/jobs");
      expect(res.status).toBe(200);
    });
    it("GET /jobs/:id → 200", async () => {
      const res = await request(app).get(`/jobs/${id}`);
      expect(res.status).toBe(200);
    });
    it("POST /jobs → 201", async () => {
      const res = await request(app).post("/jobs").send({ company: "A", role: "B" });
      expect(res.status).toBe(201);
    });
    it("PATCH /jobs/:id → 200", async () => {
      const res = await request(app).patch(`/jobs/${id}`).send({ status: "applied" });
      expect(res.status).toBe(200);
    });
    it("DELETE /jobs/:id → 204", async () => {
      const res = await request(app).delete(`/jobs/${id}`);
      expect(res.status).toBe(204);
    });
  });

  describe("recruiters", () => {
    it("GET /recruiters → 200", async () => {
      const res = await request(app).get("/recruiters");
      expect(res.status).toBe(200);
    });
    it("GET /recruiters/:id → 200", async () => {
      const res = await request(app).get(`/recruiters/${id}`);
      expect(res.status).toBe(200);
    });
    it("POST /recruiters → 201", async () => {
      const res = await request(app).post("/recruiters").send({ name: "J", email: "j@x.com" });
      expect(res.status).toBe(201);
    });
    it("PATCH /recruiters/:id → 200", async () => {
      const res = await request(app).patch(`/recruiters/${id}`).send({ name: "J" });
      expect(res.status).toBe(200);
    });
    it("DELETE /recruiters/:id → 204", async () => {
      const res = await request(app).delete(`/recruiters/${id}`);
      expect(res.status).toBe(204);
    });
  });

  describe("recruiting-firms", () => {
    it("GET /recruiting-firms → 200", async () => {
      const res = await request(app).get("/recruiting-firms");
      expect(res.status).toBe(200);
    });
    it("GET /recruiting-firms/:id → 200", async () => {
      const res = await request(app).get(`/recruiting-firms/${id}`);
      expect(res.status).toBe(200);
    });
    it("POST /recruiting-firms → 201", async () => {
      const res = await request(app).post("/recruiting-firms").send({ name: "Firm" });
      expect(res.status).toBe(201);
    });
    it("PATCH /recruiting-firms/:id → 200", async () => {
      const res = await request(app).patch(`/recruiting-firms/${id}`).send({ name: "F" });
      expect(res.status).toBe(200);
    });
    it("DELETE /recruiting-firms/:id → 204", async () => {
      const res = await request(app).delete(`/recruiting-firms/${id}`);
      expect(res.status).toBe(204);
    });
  });
});
