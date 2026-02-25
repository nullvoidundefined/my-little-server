/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.createTable("jobs", {
    id: { type: "uuid", primaryKey: true, default: pgm.func("gen_random_uuid()") },
    user_id: { type: "uuid", notNull: true, references: "users", onDelete: "CASCADE" },
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
  pgm.createIndex("jobs", ["user_id"]);
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
};
