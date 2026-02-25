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
  pgm.createTable("users", {
    id: { type: "serial", primaryKey: true },
    email: { type: "text", notNull: true, unique: true },
    password_hash: { type: "text", notNull: true },
    created_at: { type: "timestamptz", default: pgm.func("NOW()") },
    updated_at: { type: "timestamptz", default: pgm.func("NOW()") },
  });
  pgm.createIndex("users", "email", { unique: true });

  pgm.createTable("sessions", {
    id: { type: "text", primaryKey: true },
    user_id: {
      type: "integer",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    expires_at: { type: "timestamptz", notNull: true },
    created_at: { type: "timestamptz", default: pgm.func("NOW()") },
  });
  pgm.createIndex("sessions", "user_id");
  pgm.createIndex("sessions", "expires_at");

  pgm.sql(`
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql("DROP TRIGGER IF EXISTS set_updated_at ON users;");
  pgm.dropTable("sessions");
  pgm.dropTable("users");
};
