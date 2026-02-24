import { z } from "zod";

export const createRecruitingFirmSchema = z.object({
  linkedin_url: z.string().url("linkedin_url must be a valid URL").optional(),
  name: z.string().min(1, "name is required"),
  notes: z.string().optional(),
  website: z.string().url("website must be a valid URL").optional(),
});

export const patchRecruitingFirmSchema = createRecruitingFirmSchema.partial();

export const recruitingFirmSchema = createRecruitingFirmSchema.extend({
  created_at: z.coerce.date(),
  id: z.number(),
});

export type RecruitingFirm = z.infer<typeof recruitingFirmSchema>;
