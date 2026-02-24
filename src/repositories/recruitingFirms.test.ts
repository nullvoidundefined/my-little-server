import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../database/utilities/connectionPool/connectionPool.js";

import * as recruitingFirmsRepo from "./recruitingFirms.js";

vi.mock("../database/utilities/connectionPool/connectionPool.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = vi.mocked(db.query);

describe("recruitingFirms repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecruitingFirm inserts and returns row", async () => {
    const row = {
      id: 1,
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

  it("listRecruitingFirms returns rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    await recruitingFirmsRepo.listRecruitingFirms(10, 0);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [10, 0],
    );
  });

  it("getRecruitingFirmById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitingFirmsRepo.getRecruitingFirmById(999);
    expect(result).toBeNull();
  });

  it("deleteRecruitingFirm returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await recruitingFirmsRepo.deleteRecruitingFirm(999);
    expect(result).toBe(false);
  });
});
