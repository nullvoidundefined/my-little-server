import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // TODO: In a production app at scale you'd want to handle this more carefully,
  // but for a learning project connecting to Neon it's the standard pragmatic solution.
  ssl: { rejectUnauthorized: false },
});

export default pool;
