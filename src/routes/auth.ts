import express from "express";

import * as authHandlers from "../handlers/auth/auth.js";
import { authRateLimiter } from "../utils/rateLimiter.js";

const authRouter = express.Router();

authRouter.post("/register", authRateLimiter, authHandlers.register);
authRouter.post("/login", authRateLimiter, authHandlers.login);
authRouter.post("/logout", authHandlers.logout);
authRouter.get("/me", authHandlers.me);

export { authRouter };
