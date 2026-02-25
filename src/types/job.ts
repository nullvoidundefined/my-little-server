import type { z } from "zod";

import type { createJobSchema } from "app/schemas/jobs.js";

export type CreateJobInput = z.infer<typeof createJobSchema>;

export type { Job } from "app/schemas/jobs.js";
