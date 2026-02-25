/**
 * Builds SET clause and value array for a parameterized UPDATE from a partial data object.
 * Only includes fields that are present in data and allowed in allowedFields.
 */
export function buildUpdateClause<T extends string>(
  allowedFields: readonly T[],
  data: Partial<Record<T, string | number | null>>,
): { setClause: string; values: (string | number | null)[] } {
  const updates = allowedFields.filter((f) => data[f] !== undefined);
  const setClause = updates.map((f, i) => `${String(f)} = $${i + 1}`).join(", ");
  const values = updates.map((f) => data[f] ?? null);
  return { setClause, values };
}
