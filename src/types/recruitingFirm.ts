import type { z } from "zod";

import type { createRecruitingFirmSchema } from "app/schemas/recruitingFirms.js";

export type CreateRecruitingFirmInput = z.infer<typeof createRecruitingFirmSchema>;

export type { RecruitingFirm } from "app/schemas/recruitingFirms.js";
