/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable("recruiters", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
    name: { type: "text", notNull: true },
    email: { type: "text" },
    phone: { type: "text" },
    title: { type: "text" },
    linkedin_url: { type: "text" },
    firm_id: {
      type: "uuid",
      references: "recruiting_firms",
      onDelete: "SET NULL",
    },
    notes: { type: "text" },
    created_at: { type: "timestamptz", default: pgm.func("NOW()") },
    updated_at: { type: "timestamptz", default: pgm.func("NOW()") },
  });
  pgm.createIndex("recruiters", ["user_id"]);
  pgm.createIndex("recruiters", ["firm_id"]);
  pgm.sql(`
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON recruiters
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.sql("DROP TRIGGER IF EXISTS set_updated_at ON recruiters;");
  pgm.dropTable("recruiters");
};
