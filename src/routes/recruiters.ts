import express from "express";

import { createRecruiter } from "../database/queries/recruiters/create/createRecruiter.js";
import { deleteRecruiter } from "../database/queries/recruiters/delete/deleteRecruiter.js";
import { listRecruiters } from "../database/queries/recruiters/list/listRecruiters.js";
import { updateRecruiter } from "../database/queries/recruiters/update/updateRecruiter.js";

const recruitersRouter = express.Router();

recruitersRouter.get("/", listRecruiters);
recruitersRouter.post("/", createRecruiter);
recruitersRouter.patch("/:id", updateRecruiter);
recruitersRouter.delete("/:id", deleteRecruiter);

export { recruitersRouter };
