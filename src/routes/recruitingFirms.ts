import express from "express";

import { createRecruitingFirm } from "../database/queries/recruitingFirms/create/createRecruitingFirm.js";
import { deleteRecruitingFirm } from "../database/queries/recruitingFirms/delete/deleteRecruitingFirm.js";
import { listRecruitingFirms } from "../database/queries/recruitingFirms/list/listRecruitingFirms.js";
import { updateRecruitingFirm } from "../database/queries/recruitingFirms/update/updateRecruitingFirm.js";

const recruitingFirmsRouter = express.Router();

recruitingFirmsRouter.get("/", listRecruitingFirms);
recruitingFirmsRouter.post("/", createRecruitingFirm);
recruitingFirmsRouter.patch("/:id", updateRecruitingFirm);
recruitingFirmsRouter.delete("/:id", deleteRecruitingFirm);

export { recruitingFirmsRouter };
