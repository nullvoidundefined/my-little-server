import type { z } from "zod";

import type { createRecruiterSchema } from "app/schemas/recruiters.js";

export type CreateRecruiterInput = z.infer<typeof createRecruiterSchema>;

export type { Recruiter } from "app/schemas/recruiters.js";
