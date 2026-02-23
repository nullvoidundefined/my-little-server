import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // TODO: rejectUnauthorized: false skips certificate identity verification but
  // still encrypts the connection — data is protected in transit. Fine for a
  // learning project on Neon, but in a production app at scale you'd want to
  // supply the actual CA certificate instead of disabling verification.
  ssl: { rejectUnauthorized: false },
});

export default pool;
