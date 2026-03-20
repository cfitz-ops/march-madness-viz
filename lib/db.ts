// lib/db.ts
import { Pool } from "pg";

// Build-time only — never imported in client components
// Strip sslmode from connection string to avoid conflict with programmatic ssl config
const connStr = (process.env.GHOST_CONNECTION_STRING || "").replace(
  /[?&]sslmode=[^&]*/,
  ""
);

const pool = new Pool({
  connectionString: connStr,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

export async function query<T>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}
