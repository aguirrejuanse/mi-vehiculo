import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Lazily-initialized Drizzle client.
 *
 * We intentionally avoid creating the neon() client at module load time:
 * that would throw as soon as this file is imported if DATABASE_URL is
 * missing (e.g. during `next build`, which can statically analyze/import
 * server modules even for routes that only *use* the db at request time).
 * Instead we build the client on first access via a Proxy, so the app can
 * build without a real DATABASE_URL and only fails at runtime if a request
 * actually tries to hit the database without one configured.
 */
type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env.local (see .env.local.example).",
    );
  }

  const sql = neon(connectionString);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const client = getDb();
    return Reflect.get(client as object, prop, receiver);
  },
});
