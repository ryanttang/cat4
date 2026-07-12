import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { isDatabaseConfigured } from "@/lib/config";

type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | null = null;

export function getDb(): Db {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "Database is not configured. Set DATABASE_URL in .env.local or use mock mode (default when DATABASE_URL is unset)."
    );
  }

  if (!_db) {
    _db = drizzle(neon(process.env.DATABASE_URL!), { schema });
  }

  return _db;
}

/** Lazy DB access — only connects when DATABASE_URL is set. */
export const db = new Proxy({} as Db, {
  get(_target, prop) {
    return Reflect.get(getDb(), prop);
  },
});
