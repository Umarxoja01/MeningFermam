import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import type { Db } from "./index";
import { migrationsFolder } from "./migrate";
import * as schema from "./schema";

export { migrationsFolder };

/** Testlar uchun xotiradagi PostgreSQL (PGlite) — barcha migratsiyalar qo'llangan holda. */
export async function createTestDb() {
  const pg = new PGlite();
  const raw = drizzle(pg, { schema });
  await migrate(raw, { migrationsFolder });
  return { db: raw as unknown as Db, pg, close: () => pg.close() };
}
