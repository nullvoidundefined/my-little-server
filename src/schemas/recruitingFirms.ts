import { z } from "zod";

export const createRecruitingFirmSchema = z.object({
  linkedin_url: z.string().url("linkedin_url must be a valid URL").optional(),
  name: z.string().min(1, "name is required"),
  notes: z.string().optional(),
  website: z.string().url("website must be a valid URL").optional(),
});

export const patchRecruitingFirmSchema = createRecruitingFirmSchema
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

export const recruitingFirmSchema = createRecruitingFirmSchema.extend({
  created_at: z.coerce.date(),
  id: z.string().uuid("Invalid ID format"),
  updated_at: z.coerce.date(),
});

export type RecruitingFirm = z.infer<typeof recruitingFirmSchema>;
