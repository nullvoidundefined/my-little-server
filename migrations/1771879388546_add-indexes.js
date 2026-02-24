/**
 * Add indexes to support filtering and foreign-key lookups.
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createIndex("jobs", ["status"]);
  pgm.createIndex("jobs", ["company"]);
  pgm.createIndex("jobs", ["applied_date"]);
  pgm.createIndex("recruiters", ["firm_id"]);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropIndex("jobs", ["status"]);
  pgm.dropIndex("jobs", ["company"]);
  pgm.dropIndex("jobs", ["applied_date"]);
  pgm.dropIndex("recruiters", ["firm_id"]);
};
