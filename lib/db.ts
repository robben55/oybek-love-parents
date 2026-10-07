import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

type SqlClient = ReturnType<typeof postgres>;
type Database = ReturnType<typeof drizzle>;

const globalForDb = globalThis as unknown as {
  sqlClient?: SqlClient;
  notebookDb?: Database;
};

export function getDb() {
  if (globalForDb.notebookDb) {
    return globalForDb.notebookDb;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const configuredMax = Number(process.env.DB_POOL_MAX ?? "10");
  const max = Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : 10;

  const sqlClient = postgres(connectionString, {
    max,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  const database = drizzle(sqlClient);

  globalForDb.sqlClient = sqlClient;
  globalForDb.notebookDb = database;

  return database;
}
