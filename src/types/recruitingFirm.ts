import type { z } from "zod";
import type { createRecruitingFirmSchema } from "../schemas/recruitingFirms.js";

export type CreateRecruitingFirmInput = z.infer<
  typeof createRecruitingFirmSchema
>;

export type { RecruitingFirm } from "../schemas/recruitingFirms.js";

