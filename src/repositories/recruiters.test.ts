import { beforeEach, describe, expect, it, vi } from "vitest";

import db from "../database/utilities/connectionPool/connectionPool.js";

import * as recruitersRepo from "./recruiters.js";

vi.mock("../database/utilities/connectionPool/connectionPool.js", () => ({
  default: { query: vi.fn() },
}));

const mockQuery = vi.mocked(db.query);

describe("recruiters repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createRecruiter inserts and returns row", async () => {
    const row = {
      id: 1,
      name: "Jane",
      email: "jane@example.com",
      phone: null,
      title: null,
      linkedin_url: null,
      firm_id: null,
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

  it("listRecruiters returns rows", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    await recruitersRepo.listRecruiters(10, 0);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("SELECT"),
      [10, 0],
    );
  });

  it("getRecruiterById returns null when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as never);
    const result = await recruitersRepo.getRecruiterById(999);
    expect(result).toBeNull();
  });

  it("deleteRecruiter returns false when not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 } as never);
    const result = await recruitersRepo.deleteRecruiter(999);
    expect(result).toBe(false);
  });
});
