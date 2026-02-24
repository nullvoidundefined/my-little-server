import { z } from "zod";

export const JOB_STATUSES = ["applied", "interviewing", "offered", "rejected", "accepted"] as const;

export const createJobSchema = z.object({
  applied_date: z.string().date().optional(),
  company: z.string().min(1, "company is required"),
  notes: z.string().optional(),
  role: z.string().min(1, "role is required"),
  status: z.enum(JOB_STATUSES).optional(),
});

export const patchJobSchema = createJobSchema.partial().refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: "At least one field is required" },
);

export const jobSchema = createJobSchema.extend({
  id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable(),
});

export type Job = z.infer<typeof jobSchema>;
