import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { recruitingFirmsRouter } from "app/routes/recruitingFirms.js";
import { TEST_UUID } from "app/test-utils/uuids.js";

vi.mock("app/handlers/recruitingFirms/recruitingFirms.js", () => ({
  listRecruitingFirms: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "listRecruitingFirms" }),
  ),
  getRecruitingFirm: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "getRecruitingFirm", id: req.params.id }),
  ),
  createRecruitingFirm: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(201).json({ route: "createRecruitingFirm" }),
  ),
  updateRecruitingFirm: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "updateRecruitingFirm", id: req.params.id }),
  ),
  deleteRecruitingFirm: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(204).send(),
  ),
}));

const app = express();
app.use(express.json());
app.use("/recruiting-firms", recruitingFirmsRouter);

describe("recruitingFirmsRouter", () => {
  it("routes GET /recruiting-firms to listRecruitingFirms", async () => {
    const res = await request(app).get("/recruiting-firms");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "listRecruitingFirms" });
  });

  it("routes GET /recruiting-firms/:id to getRecruitingFirm", async () => {
    const res = await request(app).get(`/recruiting-firms/${TEST_UUID}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "getRecruitingFirm", id: TEST_UUID });
  });

  it("routes POST /recruiting-firms to createRecruitingFirm", async () => {
    const res = await request(app).post("/recruiting-firms").send({ any: "payload" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ route: "createRecruitingFirm" });
  });

  it("routes PATCH /recruiting-firms/:id to updateRecruitingFirm", async () => {
    const res = await request(app).patch(`/recruiting-firms/${TEST_UUID}`).send({ any: "payload" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "updateRecruitingFirm", id: TEST_UUID });
  });

  it("routes DELETE /recruiting-firms/:id to deleteRecruitingFirm", async () => {
    const res = await request(app).delete(`/recruiting-firms/${TEST_UUID}`);

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });
});
