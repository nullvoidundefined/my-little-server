import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { jobsRouter } from "app/routes/jobs.js";
import { TEST_UUID } from "app/test-utils/uuids.js";

vi.mock("app/handlers/jobs/jobs.js", () => ({
  listJobs: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "listJobs" }),
  ),
  getJob: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "getJob", id: req.params.id }),
  ),
  createJob: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(201).json({ route: "createJob" }),
  ),
  updateJob: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "updateJob", id: req.params.id }),
  ),
  deleteJob: vi.fn((_req: express.Request, res: express.Response) => res.status(204).send()),
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

  it("routes GET /jobs/:id to getJob", async () => {
    const res = await request(app).get(`/jobs/${TEST_UUID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "getJob", id: TEST_UUID });
  });

  it("routes POST /jobs to createJob", async () => {
    const res = await request(app).post("/jobs").send({ any: "payload" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ route: "createJob" });
  });

  it("routes PATCH /jobs/:id to updateJob", async () => {
    const res = await request(app).patch(`/jobs/${TEST_UUID}`).send({ any: "payload" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "updateJob", id: TEST_UUID });
  });

  it("routes DELETE /jobs/:id to deleteJob", async () => {
    const res = await request(app).delete(`/jobs/${TEST_UUID}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
