/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("jobs", {
    applied_date: { type: "date" },
    company: { type: "text", notNull: true },
    created_at: { type: "timestamp", default: pgm.func("NOW()") },
    id: { type: "serial", primaryKey: true },
    notes: { type: "text" },
    role: { type: "text", notNull: true },
    status: { type: "text", default: "applied" },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("jobs");
};
