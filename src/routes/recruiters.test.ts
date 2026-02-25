import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { recruitersRouter } from "./recruiters.js";

vi.mock("../handlers/recruiters.js", () => ({
  listRecruiters: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "listRecruiters" }),
  ),
  getRecruiter: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "getRecruiter", id: req.params.id }),
  ),
  createRecruiter: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(201).json({ route: "createRecruiter" }),
  ),
  updateRecruiter: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "updateRecruiter", id: req.params.id }),
  ),
  deleteRecruiter: vi.fn((_req: express.Request, res: express.Response) => res.status(204).send()),
}));

const app = express();
app.use(express.json());
app.use("/recruiters", recruitersRouter);

describe("recruitersRouter", () => {
  it("routes GET /recruiters to listRecruiters", async () => {
    const res = await request(app).get("/recruiters");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "listRecruiters" });
  });

  it("routes GET /recruiters/:id to getRecruiter", async () => {
    const res = await request(app).get("/recruiters/123");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "getRecruiter", id: "123" });
  });

  it("routes POST /recruiters to createRecruiter", async () => {
    const res = await request(app).post("/recruiters").send({ any: "payload" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ route: "createRecruiter" });
  });

  it("routes PATCH /recruiters/:id to updateRecruiter", async () => {
    const res = await request(app).patch("/recruiters/123").send({ any: "payload" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "updateRecruiter", id: "123" });
  });

  it("routes DELETE /recruiters/:id to deleteRecruiter", async () => {
    const res = await request(app).delete("/recruiters/456");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
