import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// ----------
// Declare exports first (ESM requirement)
// ----------
export let pool: pg.Pool | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let db: any = null;

// ----------
// Init logic
// ----------
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "[dev] DATABASE_URL not set. Starting server in NO-DB mode (Postgres disabled).",
    );
    // pool/db stay null
  } else {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
} else {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle(pool, { schema });
}