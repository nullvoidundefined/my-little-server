import { describe, expect, it } from "vitest";

import { createJobSchema, patchJobSchema } from "app/schemas/jobs.js";

describe("createJobSchema", () => {
  it("accepts required fields only", () => {
    const result = createJobSchema.safeParse({ company: "Acme", role: "Engineer" });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = createJobSchema.safeParse({
      company: "Acme",
      role: "Engineer",
      status: "applied",
      applied_date: "2025-01-15",
      notes: "Applied via website",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty company", () => {
    const result = createJobSchema.safeParse({ company: "", role: "Engineer" });
    expect(result.success).toBe(false);
  });

  it("rejects empty role", () => {
    const result = createJobSchema.safeParse({ company: "Acme", role: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createJobSchema.safeParse({
      company: "Acme",
      role: "Engineer",
      status: "unknown",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid statuses", () => {
    for (const status of ["applied", "interviewing", "offered", "rejected", "accepted"]) {
      const result = createJobSchema.safeParse({ company: "Acme", role: "Engineer", status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid date format for applied_date", () => {
    const result = createJobSchema.safeParse({
      company: "Acme",
      role: "Engineer",
      applied_date: "not-a-date",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    expect(createJobSchema.safeParse({}).success).toBe(false);
    expect(createJobSchema.safeParse({ company: "Acme" }).success).toBe(false);
    expect(createJobSchema.safeParse({ role: "Engineer" }).success).toBe(false);
  });
});

describe("patchJobSchema", () => {
  it("accepts a single field update", () => {
    const result = patchJobSchema.safeParse({ company: "NewCo" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty object", () => {
    const result = patchJobSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error!.issues[0]!.message).toBe("At least one field is required");
  });

  it("rejects invalid status on patch", () => {
    const result = patchJobSchema.safeParse({ status: "bogus" });
    expect(result.success).toBe(false);
  });
});
