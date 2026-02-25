import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { authRouter } from "app/routes/auth.js";
import { TEST_UUID } from "app/test-utils/uuids.js";

vi.mock("app/handlers/auth/auth.js", () => ({
  register: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(201).json({ route: "register" }),
  ),
  login: vi.fn((_req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "login" }),
  ),
  logout: vi.fn((_req: express.Request, res: express.Response) => res.status(204).send()),
  me: vi.fn((req: express.Request, res: express.Response) =>
    res.status(200).json({ route: "me", user: req.user ?? null }),
  ),
}));

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("authRouter", () => {
  it("routes POST /auth/register to register", async () => {
    const res = await request(app).post("/auth/register").send({ email: "a@b.com", password: "x" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ route: "register" });
  });

  it("routes POST /auth/login to login", async () => {
    const res = await request(app).post("/auth/login").send({ email: "a@b.com", password: "x" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "login" });
  });

  it("routes POST /auth/logout to logout", async () => {
    const res = await request(app).post("/auth/logout");

    expect(res.status).toBe(204);
    expect(res.body).toEqual({});
  });

  it("routes GET /auth/me to me", async () => {
    const res = await request(app).get("/auth/me");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ route: "me", user: null });
  });
});
