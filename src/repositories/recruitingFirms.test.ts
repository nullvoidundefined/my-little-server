import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "app/db/pool.js";
import * as recruitingFirmsRepo from "app/repositories/recruitingFirms.js";
import { TEST_UUID } from "app/test-utils/uuids.js";

vi.mock("app/db/pool.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = vi.mocked(db.query);

describe("recruitingFirms repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecruitingFirm inserts and returns row", async () => {
    const row = {
      id: TEST_UUID,
      name: "Acme",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);
    const result = await recruitingFirmsRepo.createRecruitingFirm({ name: "Acme" });
    expect(result).toEqual(row);
  });

  it("createRecruitingFirm throws when insert returns no row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 0 } as never);
    await expect(recruitingFirmsRepo.createRecruitingFirm({ name: "Acme" })).rejects.toThrow(
      "Insert returned no row",
    );
  });

  it("createRecruitingFirm passes null for optional fields", async () => {
    const row = {
      id: TEST_UUID,
      name: "Acme",
      website: "https://acme.com",
      linkedin_url: "https://linkedin.com/acme",
      notes: "notes",
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row], rowCount: 1 } as never);
    await recruitingFirmsRepo.createRecruitingFirm({
      name: "Acme",
      website: "https://acme.com",
      linkedin_url: "https://linkedin.com/acme",
      notes: "notes",
    });
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("INSERT"), [
      "Acme",
      "https://acme.com",
      "https://linkedin.com/acme",
      "notes",
    ]);
  });

  it("getRecruitingFirmsTotalCount returns 0 when no rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmsTotalCount();
    expect(result).toBe(0);
  });

  it("getRecruitingFirmsTotalCount returns count from first row", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ count: "5" }] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmsTotalCount();
    expect(result).toBe(5);
  });

  it("getRecruitingFirmById returns row when found", async () => {
    const row = {
      id: TEST_UUID,
      name: "Acme",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmById(TEST_UUID);
    expect(result).toEqual(row);
  });

  it("updateRecruitingFirm throws when no fields provided", async () => {
    await expect(recruitingFirmsRepo.updateRecruitingFirm(TEST_UUID, {})).rejects.toThrow(
      "At least one field required for update",
    );
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("updateRecruitingFirm returns row when updated", async () => {
    const row = {
      id: TEST_UUID,
      name: "Acme Recruiting",
      website: null,
      linkedin_url: null,
      notes: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockQuery.mockResolvedValueOnce({ rows: [row] } as never);
    const result = await recruitingFirmsRepo.updateRecruitingFirm(TEST_UUID, {
      name: "Acme Recruiting",
    });
    expect(result).toEqual(row);
  });

  it("deleteRecruitingFirm returns true when row deleted", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 } as never);
    const result = await recruitingFirmsRepo.deleteRecruitingFirm(TEST_UUID);
    expect(result).toBe(true);
  });

  it("listRecruitingFirms returns rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    await recruitingFirmsRepo.listRecruitingFirms(10, 0);
    expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT"), [10, 0]);
  });

  it("getRecruitingFirmById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmById(TEST_UUID);
    expect(result).toBeNull();
  });

  it("deleteRecruitingFirm returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await recruitingFirmsRepo.deleteRecruitingFirm(TEST_UUID);
    expect(result).toBe(false);
  });
});
