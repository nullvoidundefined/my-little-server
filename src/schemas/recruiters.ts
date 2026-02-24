import { z } from "zod";

export const createRecruiterSchema = z.object({
  email: z.string().email("email must be valid").optional(),
  firm_id: z.number().int().positive().optional(),
  linkedin_url: z.string().url("linkedin_url must be a valid URL").optional(),
  name: z.string().min(1, "name is required"),
  notes: z.string().optional(),
  phone: z.string().optional(),
  title: z.string().optional(),
});

export const patchRecruiterSchema = createRecruiterSchema.partial().refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: "At least one field is required" },
);

export const recruiterSchema = createRecruiterSchema.extend({
  id: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date().nullable(),
});

export type Recruiter = z.infer<typeof recruiterSchema>;
