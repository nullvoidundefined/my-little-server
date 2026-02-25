import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "app/db/pool.js";
import * as recruitersRepo from "app/repositories/recruiters.js";
import { TEST_UUID } from "app/test-utils/uuids.js";

vi.mock("app/db/pool.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = vi.mocked(db.query);

describe("recruiters repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecruiter inserts and returns row", async () => {
    const row = {
      id: TEST_UUID,
      name: "Jane",
      email: "jane@example.com",
      phone: null,
      title: null,
      linkedin_url: null,
      firm_id: null as string | null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);
    const result = await recruitersRepo.createRecruiter({
      name: "Jane",
      email: "jane@example.com",
    });
    expect(result).toEqual(row);
  });

  it("createRecruiter throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(
      recruitersRepo.createRecruiter({ name: "Jane", email: "jane@example.com" }),
    ).rejects.toThrow("Insert returned no row");
  });

  it("createRecruiter passes null for optional fields", async () => {
    const row = {
      id: TEST_UUID,
      name: "Jane",
      email: "jane@example.com",
      phone: "555-1234",
      title: "Lead",
      linkedin_url: "https://linkedin.com/jane",
      firm_id: TEST_UUID,
      notes: "notes",
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);
    await recruitersRepo.createRecruiter({
      name: "Jane",
      email: "jane@example.com",
      phone: "555-1234",
      title: "Lead",
      linkedin_url: "https://linkedin.com/jane",
      firm_id: TEST_UUID,
      notes: "notes",
    });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
      "Jane",
      "jane@example.com",
      "555-1234",
      "Lead",
      "https://linkedin.com/jane",
      TEST_UUID,
      "notes",
    ]);
  });

  it("getRecruitersTotalCount returns 0 when no rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitersRepo.getRecruitersTotalCount();
    expect(result).toBe(0);
  });

  it("getRecruitersTotalCount returns count from first row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: "10" }] } as never);
    const result = await recruitersRepo.getRecruitersTotalCount();
    expect(result).toBe(10);
  });

  it("getRecruiterById returns row when found", async () => {
    const row = {
      id: TEST_UUID,
      name: "Jane",
      email: "jane@example.com",
      phone: null,
      title: null,
      linkedin_url: null,
      firm_id: null as string | null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await recruitersRepo.getRecruiterById(TEST_UUID);
    expect(result).toEqual(row);
  });

  it("updateRecruiter throws when no fields provided", async () => {
    await expect(recruitersRepo.updateRecruiter(TEST_UUID, {})).rejects.toThrow(
      "At least one field required for update",
    );
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("updateRecruiter returns row when updated", async () => {
    const row = {
      id: TEST_UUID,
      name: "Jane Doe",
      email: "jane@example.com",
      phone: null,
      title: null,
      linkedin_url: null,
      firm_id: null as string | null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await recruitersRepo.updateRecruiter(TEST_UUID, { name: "Jane Doe" });
    expect(result).toEqual(row);
  });

  it("deleteRecruiter returns true when row deleted", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 } as never);
    const result = await recruitersRepo.deleteRecruiter(TEST_UUID);
    expect(result).toBe(true);
  });

  it("listRecruiters returns rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    await recruitersRepo.listRecruiters(10, 0);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [10, 0]);
  });

  it("getRecruiterById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitersRepo.getRecruiterById(TEST_UUID);
    expect(result).toBeNull();
  });

  it("deleteRecruiter returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await recruitersRepo.deleteRecruiter(TEST_UUID);
    expect(result).toBe(false);
  });
});
