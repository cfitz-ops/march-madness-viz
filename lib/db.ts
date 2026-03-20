// lib/db.ts
import { Pool } from "pg";

// Build-time only — never imported in client components
const pool = new Pool({
  connectionString: process.env.GHOST_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

export async function query<T extends Record<string, unknown>>(
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
