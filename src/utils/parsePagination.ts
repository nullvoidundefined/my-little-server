const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export function parsePagination(
  limitParam: unknown,
  offsetParam: unknown,
): { limit: number; offset: number } {
  const limit = Math.min(
    Math.max(1, Number(limitParam) || DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  const offset = Math.max(0, Number(offsetParam) || 0);
  return { limit, offset };
}
