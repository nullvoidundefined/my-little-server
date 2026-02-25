/**
 * Create set_updated_at() and jobs table. Requires PostgreSQL 13+ (gen_random_uuid()).
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.createTable("jobs", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    company: { type: "text", notNull: true },
    role: { type: "text", notNull: true },
    status: { type: "text", default: "applied" },
    applied_date: { type: "date" },
    notes: { type: "text" },
    created_at: { type: "timestamptz", default: pgm.func("NOW()") },
    updated_at: { type: "timestamptz", default: pgm.func("NOW()") },
  });
  pgm.addConstraint("jobs", "jobs_status_check", {
    check: "status IN ('applied', 'interviewing', 'offered', 'rejected', 'accepted')",
  });
  pgm.createIndex("jobs", ["status"]);
  pgm.createIndex("jobs", ["company"]);
  pgm.createIndex("jobs", ["applied_date"]);
  pgm.sql(`
    CREATE TRIGGER set_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.sql("DROP TRIGGER IF EXISTS set_updated_at ON jobs;");
  pgm.dropTable("jobs");
  pgm.sql("DROP FUNCTION IF EXISTS set_updated_at();");
};
