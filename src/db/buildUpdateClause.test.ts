import { describe, expect, it } from "vitest";

import { buildUpdateClause } from "app/db/buildUpdateClause.js";

const ALLOWED = ["name", "email", "notes"] as const;

describe("buildUpdateClause", () => {
  it("builds SET clause for a single field", () => {
    const { setClause, values } = buildUpdateClause(ALLOWED, { name: "Alice" });
    expect(setClause).toBe("name = $1");
    expect(values).toEqual(["Alice"]);
  });

  it("builds SET clause for multiple fields in allowedFields order", () => {
    const { setClause, values } = buildUpdateClause(ALLOWED, {
      email: "a@b.com",
      name: "Alice",
    });
    expect(setClause).toBe("name = $1, email = $2");
    expect(values).toEqual(["Alice", "a@b.com"]);
  });

  it("maps undefined values to null via ??", () => {
    const { values } = buildUpdateClause(ALLOWED, { name: undefined, email: "a@b.com" });
    expect(values).toEqual(["a@b.com"]);
  });

  it("preserves explicit null values", () => {
    const { setClause, values } = buildUpdateClause(ALLOWED, { notes: null });
    expect(setClause).toBe("notes = $1");
    expect(values).toEqual([null]);
  });

  it("returns empty clause when no allowed fields are present", () => {
    const { setClause, values } = buildUpdateClause(ALLOWED, {});
    expect(setClause).toBe("");
    expect(values).toEqual([]);
  });

  it("ignores fields not in allowedFields", () => {
    const data = { name: "Alice", bogus: "ignored" } as Record<string, string>;
    const { setClause, values } = buildUpdateClause(ALLOWED, data);
    expect(setClause).toBe("name = $1");
    expect(values).toEqual(["Alice"]);
  });

  it("handles numeric values", () => {
    const fields = ["count", "label"] as const;
    const { setClause, values } = buildUpdateClause(fields, { count: 42, label: "x" });
    expect(setClause).toBe("count = $1, label = $2");
    expect(values).toEqual([42, "x"]);
  });
});
