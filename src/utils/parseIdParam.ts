/**
 * Parses a route param (string | string[] | undefined) as a positive integer ID.
 * Returns null if the value is not a valid positive integer.
 */
export function parseIdParam(id: string | string[] | undefined): number | null {
  const raw = Array.isArray(id) ? id[0] : id;
  const s = typeof raw === "string" ? raw : "";
  const n = Number(s);
  return Number.isInteger(n) && n > 0 ? n : null;
}
