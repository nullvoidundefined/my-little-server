import { describe, expect, it } from "vitest";

import { createRecruiterSchema, patchRecruiterSchema } from "app/schemas/recruiters.js";

describe("createRecruiterSchema", () => {
  it("accepts name only (all other fields optional)", () => {
    const result = createRecruiterSchema.safeParse({ name: "Jane" });
    expect(result.success).toBe(true);
  });

  it("accepts all fields", () => {
    const result = createRecruiterSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      phone: "555-1234",
      title: "Senior Recruiter",
      linkedin_url: "https://linkedin.com/in/jane",
      firm_id: "550e8400-e29b-41d4-a716-446655440000",
      notes: "Met at conference",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createRecruiterSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = createRecruiterSchema.safeParse({ email: "a@b.com" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = createRecruiterSchema.safeParse({ name: "Jane", email: "not-email" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid linkedin_url", () => {
    const result = createRecruiterSchema.safeParse({ name: "Jane", linkedin_url: "not-a-url" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid firm_id (non-UUID)", () => {
    const result = createRecruiterSchema.safeParse({ name: "Jane", firm_id: "abc" });
    expect(result.success).toBe(false);
  });
});

describe("patchRecruiterSchema", () => {
  it("accepts a single field update", () => {
    const result = patchRecruiterSchema.safeParse({ name: "Updated" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = patchRecruiterSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe("At least one field is required");
  });

  it("still validates field constraints on patch", () => {
    expect(patchRecruiterSchema.safeParse({ email: "bad" }).success).toBe(false);
    expect(patchRecruiterSchema.safeParse({ firm_id: "bad" }).success).toBe(false);
  });
});
