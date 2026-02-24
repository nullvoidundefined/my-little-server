import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { jobsRouter } from "./jobs.js";

vi.mock("../database/queries/jobs/list/listJobs.js", () => ({
  listJobs: vi.fn((_req, res) => res.status(200).json({ route: "listJobs" })),
}));

vi.mock("../database/queries/jobs/create/createJob.js", () => ({
  createJob: vi.fn((_req, res) => res.status(201).json({ route: "createJob" })),
}));

vi.mock("../database/queries/jobs/update/updateJob.js", () => ({
  updateJob: vi.fn((req, res) => res.status(200).json({ route: "updateJob", id: req.params.id })),
}));

vi.mock("../database/queries/jobs/delete/deleteJob.js", () => ({
  deleteJob: vi.fn((_req, res) => res.status(204).send()),
}));

const app = express();
app.use(express.json());
app.use("/jobs", jobsRouter);

describe("jobsRouter", () => {
  it("routes GET /jobs to listJobs", async () => {
    const res = await request(app).get("/jobs");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "listJobs" });
  });

  it("routes POST /jobs to createJob", async () => {
    const res = await request(app).post("/jobs").send({ any: "payload" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ route: "createJob" });
  });

  it("routes PATCH /jobs/:id to updateJob", async () => {
    const res = await request(app).patch("/jobs/123").send({ any: "payload" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "updateJob", id: "123" });
  });

  it("routes DELETE /jobs/:id to deleteJob", async () => {
    const res = await request(app).delete("/jobs/456");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
