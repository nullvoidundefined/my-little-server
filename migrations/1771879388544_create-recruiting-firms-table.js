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
  pgm.createTable("recruiting_firms", {
    id: { type: "serial", primaryKey: true },
    name: { type: "text", notNull: true },
    website: { type: "text" },
    linkedin_url: { type: "text" },
    notes: { type: "text" },
    created_at: { type: "timestamp", default: pgm.func("NOW()") },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("recruiting_firms");
};

