import express from "express";

import * as recruitingFirmsHandlers from "../handlers/recruitingFirms/recruitingFirms.js";

const recruitingFirmsRouter = express.Router();

recruitingFirmsRouter.get("/", recruitingFirmsHandlers.listRecruitingFirms);
recruitingFirmsRouter.get("/:id", recruitingFirmsHandlers.getRecruitingFirm);
recruitingFirmsRouter.post("/", recruitingFirmsHandlers.createRecruitingFirm);
recruitingFirmsRouter.patch("/:id", recruitingFirmsHandlers.updateRecruitingFirm);
recruitingFirmsRouter.delete("/:id", recruitingFirmsHandlers.deleteRecruitingFirm);

export { recruitingFirmsRouter };
