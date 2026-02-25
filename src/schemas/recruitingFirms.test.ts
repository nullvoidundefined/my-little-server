import { describe, expect, it } from "vitest";

import {
  createRecruitingFirmSchema,
  patchRecruitingFirmSchema,
} from "app/schemas/recruitingFirms.js";

describe("createRecruitingFirmSchema", () => {
  it("accepts name only", () => {
    const result = createRecruitingFirmSchema.safeParse({ name: "Acme Staffing" });
    expect(result.success).toBe(true);
  });

  it("accepts all fields", () => {
    const result = createRecruitingFirmSchema.safeParse({
      name: "Acme Staffing",
      website: "https://acme.com",
      linkedin_url: "https://linkedin.com/company/acme",
      notes: "Top firm",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createRecruitingFirmSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createRecruitingFirmSchema.safeParse({ website: "https://example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid website URL", () => {
    const result = createRecruitingFirmSchema.safeParse({ name: "Acme", website: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid linkedin_url", () => {
    const result = createRecruitingFirmSchema.safeParse({
      name: "Acme",
      linkedin_url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});

describe("patchRecruitingFirmSchema", () => {
  it("accepts a single field update", () => {
    const result = patchRecruitingFirmSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = patchRecruitingFirmSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe("At least one field is required");
  });

  it("still validates URL constraints on patch", () => {
    expect(patchRecruitingFirmSchema.safeParse({ website: "bad" }).success).toBe(false);
    expect(patchRecruitingFirmSchema.safeParse({ linkedin_url: "bad" }).success).toBe(false);
  });
});
