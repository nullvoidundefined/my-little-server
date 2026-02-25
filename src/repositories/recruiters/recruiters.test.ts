import { beforeEach, describe, expect, it, vi } from "vitest";

import { query } from "app/db/pool/pool.js";
import * as recruitersRepo from "app/repositories/recruiters/recruiters.js";
import { mockResult } from "app/utils/tests/mockResult.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/db/pool/pool.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);
const userId = uuid();

describe("recruiters repository", () => {
  const id = uuid();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecruiter inserts and returns row", async () => {
    const row = {
      id,
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
    mockQuery.mockResolvedValueOnce(mockResult([row]));
    const result = await recruitersRepo.createRecruiter(userId, {
      name: "Jane",
      email: "jane@example.com",
    });
    expect(result).toEqual(row);
  });

  it("createRecruiter throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([], 0));
    await expect(
      recruitersRepo.createRecruiter(userId, { name: "Jane", email: "jane@example.com" }),
    ).rejects.toThrow("Insert returned no row");
  });

  it("createRecruiter passes null for optional fields", async () => {
    const row = {
      id: id,
      name: "Jane",
      email: "jane@example.com",
      phone: "555-1234",
      title: "Lead",
      linkedin_url: "https://linkedin.com/jane",
      firm_id: id,
      notes: "notes",
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce(mockResult([row]));
    await recruitersRepo.createRecruiter(userId, {
      name: "Jane",
      email: "jane@example.com",
      phone: "555-1234",
      title: "Lead",
      linkedin_url: "https://linkedin.com/jane",
      firm_id: id,
      notes: "notes",
    });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
      userId,
      "Jane",
      "jane@example.com",
      "555-1234",
      "Lead",
      "https://linkedin.com/jane",
      id,
      "notes",
    ]);
  });

  it("getRecruitersTotalCount returns 0 when no rows", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([]));
    const result = await recruitersRepo.getRecruitersTotalCount(userId);
    expect(result).toBe(0);
  });

  it("getRecruitersTotalCount returns count from first row", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([{ count: "10" }]));
    const result = await recruitersRepo.getRecruitersTotalCount(userId);
    expect(result).toBe(10);
  });

  it("getRecruiterById returns row when found", async () => {
    const row = {
      id: id,
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
    mockQuery.mockResolvedValueOnce(mockResult([row]));
    const result = await recruitersRepo.getRecruiterById(userId, id);
    expect(result).toEqual(row);
  });

  it("updateRecruiter returns null when no fields provided", async () => {
    const result = await recruitersRepo.updateRecruiter(userId, id, {});
    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("updateRecruiter returns row when updated", async () => {
    const row = {
      id: id,
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
    mockQuery.mockResolvedValueOnce(mockResult([row]));
    const result = await recruitersRepo.updateRecruiter(userId, id, { name: "Jane Doe" });
    expect(result).toEqual(row);
  });

  it("deleteRecruiter returns true when row deleted", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([], 1));
    const result = await recruitersRepo.deleteRecruiter(userId, id);
    expect(result).toBe(true);
  });

  it("listRecruiters returns rows", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([]));
    await recruitersRepo.listRecruiters(userId, 10, 0);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [userId, 10, 0]);
  });

  it("getRecruiterById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([]));
    const result = await recruitersRepo.getRecruiterById(userId, id);
    expect(result).toBeNull();
  });

  it("deleteRecruiter returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce(mockResult([], 0));
    const result = await recruitersRepo.deleteRecruiter(userId, id);
    expect(result).toBe(false);
  });
});
