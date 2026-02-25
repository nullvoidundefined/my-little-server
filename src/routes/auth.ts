import express from "express";

import * as authHandlers from "../handlers/auth/auth.js";
import { authRateLimiter } from "../utils/rateLimiter.js";

const authRouter = express.Router();
authRouter.use(authRateLimiter);

authRouter.post("/register", authHandlers.register);
authRouter.post("/login", authHandlers.login);
authRouter.post("/logout", authHandlers.logout);
authRouter.get("/me", authHandlers.me);

export { authRouter };
