import express from "express";

import * as authHandlers from "app/handlers/auth/auth.js";
import { authRateLimiter } from "app/utils/rateLimiter.js";

const authRouter = express.Router();

authRouter.post("/register", authRateLimiter, authHandlers.register);
authRouter.post("/login", authRateLimiter, authHandlers.login);
authRouter.post("/logout", authHandlers.logout);
authRouter.get("/me", authHandlers.me);

export { authRouter };
