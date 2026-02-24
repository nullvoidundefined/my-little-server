import type { z } from "zod";

import type { createJobSchema } from "../schemas/jobs.js";

export type CreateJobInput = z.infer<typeof createJobSchema>;

export type { Job } from "../schemas/jobs.js";
