/**
 * Use timestamptz for created_at and add updated_at with auto-update trigger.
 * Leaves serial columns as-is (converting to identity would require table rewrite).
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  const tables = ["jobs", "recruiting_firms", "recruiters"];

  for (const table of tables) {
    pgm.alterColumn(table, "created_at", {
      type: "timestamptz",
      default: pgm.func("NOW()"),
    });
    pgm.addColumn(table, {
      updated_at: {
        type: "timestamptz",
        default: pgm.func("NOW()"),
      },
    });
  }

  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  for (const table of tables) {
    pgm.sql(`
      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    `);
  }
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  const tables = ["jobs", "recruiting_firms", "recruiters"];

  for (const table of tables) {
    pgm.sql(`DROP TRIGGER IF EXISTS set_updated_at ON ${table};`);
    pgm.dropColumn(table, "updated_at");
    pgm.alterColumn(table, "created_at", {
      type: "timestamp",
      default: pgm.func("NOW()"),
    });
  }

  pgm.sql("DROP FUNCTION IF EXISTS set_updated_at();");
};
