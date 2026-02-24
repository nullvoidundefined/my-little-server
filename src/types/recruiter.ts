import type { z } from "zod";

import type { createRecruiterSchema } from "../schemas/recruiters.js";

export type CreateRecruiterInput = z.infer<typeof createRecruiterSchema>;

export type { Recruiter } from "../schemas/recruiters.js";
