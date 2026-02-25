import express from "express";

import * as recruitersHandlers from "app/handlers/recruiters/recruiters.js";

const recruitersRouter = express.Router();

recruitersRouter.get("/", recruitersHandlers.listRecruiters);
recruitersRouter.get("/:id", recruitersHandlers.getRecruiter);
recruitersRouter.post("/", recruitersHandlers.createRecruiter);
recruitersRouter.patch("/:id", recruitersHandlers.updateRecruiter);
recruitersRouter.delete("/:id", recruitersHandlers.deleteRecruiter);

export { recruitersRouter };
