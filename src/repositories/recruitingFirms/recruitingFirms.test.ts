import { beforeEach, describe, expect, it, vi } from "vitest";

import { query } from "app/db/pool.js";
import * as recruitingFirmsRepo from "app/repositories/recruitingFirms/recruitingFirms.js";
import { uuid } from "app/utils/tests/uuids.js";

vi.mock("app/db/pool.js", () => ({
  query: vi.fn(),
}));

const mockQuery = vi.mocked(query);
const userId = uuid();

describe("recruitingFirms repository", () => {
  const id = uuid();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecruitingFirm inserts and returns row", async () => {
    const row = {
      id,
      name: "Acme",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);
    const result = await recruitingFirmsRepo.createRecruitingFirm(userId, { name: "Acme" });
    expect(result).toEqual(row);
  });

  it("createRecruitingFirm throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(
      recruitingFirmsRepo.createRecruitingFirm(userId, { name: "Acme" }),
    ).rejects.toThrow("Insert returned no row");
  });

  it("createRecruitingFirm passes null for optional fields", async () => {
    const row = {
      id: id,
      name: "Acme",
      website: "https://acme.com",
      linkedin_url: "https://linkedin.com/acme",
      notes: "notes",
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);
    await recruitingFirmsRepo.createRecruitingFirm(userId, {
      name: "Acme",
      website: "https://acme.com",
      linkedin_url: "https://linkedin.com/acme",
      notes: "notes",
    });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
      userId,
      "Acme",
      "https://acme.com",
      "https://linkedin.com/acme",
      "notes",
    ]);
  });

  it("getRecruitingFirmsTotalCount returns 0 when no rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmsTotalCount(userId);
    expect(result).toBe(0);
  });

  it("getRecruitingFirmsTotalCount returns count from first row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: "5" }] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmsTotalCount(userId);
    expect(result).toBe(5);
  });

  it("getRecruitingFirmById returns row when found", async () => {
    const row = {
      id: id,
      name: "Acme",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmById(userId, id);
    expect(result).toEqual(row);
  });

  it("updateRecruitingFirm returns null when no fields provided", async () => {
    const result = await recruitingFirmsRepo.updateRecruitingFirm(userId, id, {});
    expect(result).toBeNull();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("updateRecruitingFirm returns row when updated", async () => {
    const row = {
      id: id,
      name: "Acme Recruiting",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await recruitingFirmsRepo.updateRecruitingFirm(userId, id, {
      name: "Acme Recruiting",
    });
    expect(result).toEqual(row);
  });

  it("deleteRecruitingFirm returns true when row deleted", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 } as never);
    const result = await recruitingFirmsRepo.deleteRecruitingFirm(userId, id);
    expect(result).toBe(true);
  });

  it("listRecruitingFirms returns rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    await recruitingFirmsRepo.listRecruitingFirms(userId, 10, 0);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [userId, 10, 0]);
  });

  it("getRecruitingFirmById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmById(userId, id);
    expect(result).toBeNull();
  });

  it("deleteRecruitingFirm returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await recruitingFirmsRepo.deleteRecruitingFirm(userId, id);
    expect(result).toBe(false);
  });
});
