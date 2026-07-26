import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __afiliProPool?: Pool;
  __afiliProDb?: NodePgDatabase;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const needsSsl =
    databaseUrl.includes("neon.tech") ||
    databaseUrl.includes("supabase") ||
    databaseUrl.includes("sslmode=require");

  return new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
  });
}

function getPool(): Pool {
  if (!globalForDb.__afiliProPool) {
    globalForDb.__afiliProPool = createPool();
  }
  return globalForDb.__afiliProPool;
}

function getDb(): NodePgDatabase {
  if (!globalForDb.__afiliProDb) {
    globalForDb.__afiliProDb = drizzle(getPool());
  }
  return globalForDb.__afiliProDb;
}

/**
 * Lazy database client.
 * The real connection is only created the first time a query runs,
 * never during the build step — this prevents build-time failures
 * when DATABASE_URL is not yet available.
 */
export const db = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb as object, prop, receiver);
    return typeof value === "function" ? value.bind(realDb) : value;
  },
});

export { getPool as pool };
