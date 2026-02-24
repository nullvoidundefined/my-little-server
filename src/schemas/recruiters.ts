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

export const patchRecruiterSchema = createRecruiterSchema.partial();

export const recruiterSchema = createRecruiterSchema.extend({
  id: z.number(),
  created_at: z.coerce.date(),
});

export type Recruiter = z.infer<typeof recruiterSchema>;
