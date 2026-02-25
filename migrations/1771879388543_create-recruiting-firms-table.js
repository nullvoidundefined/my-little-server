/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable("recruiting_firms", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    name: { type: "text", notNull: true },
    website: { type: "text" },
    linkedin_url: { type: "text" },
    notes: { type: "text" },
    created_at: { type: "timestamptz", default: pgm.func("NOW()") },
    updated_at: { type: "timestamptz", default: pgm.func("NOW()") },
  });
  pgm.sql(`
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON recruiting_firms
    FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  `);
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.sql("DROP TRIGGER IF EXISTS set_updated_at ON recruiting_firms;");
  pgm.dropTable("recruiting_firms");
};
