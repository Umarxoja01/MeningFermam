import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export * as schema from "./schema";

/** Postgres-js va PGlite uchun umumiy tur. */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
export type DbHandle = { db: Db; close: () => Promise<void> };

/**
 * Bazaga ulanish. URL faqat serverdagi env'dan olinadi; klientga chiqmaydi.
 *  - `postgres://…` / `postgresql://…` — serverdagi PostgreSQL (Eskiz VPS);
 *  - `pglite:<papka>` — lokal ishlab chiqish va E2E testlar (fayldagi PGlite); `pglite:` — xotirada.
 */
export async function openDb(url: string, opts: { max?: number } = {}): Promise<DbHandle> {
  if (url.startsWith("pglite:")) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const dir = url.slice("pglite:".length);
    if (dir) (await import("node:fs")).mkdirSync((await import("node:path")).dirname(dir), { recursive: true });
    const pg = new PGlite(dir || undefined);
    return { db: drizzle(pg, { schema }) as unknown as Db, close: () => pg.close() };
  }
  if (!/^postgres(ql)?:\/\//.test(url)) throw new Error("DATABASE_URL noto'g'ri: postgres:// yoki pglite: bo'lishi kerak");
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const client = postgres(url, { max: opts.max ?? 10, prepare: true });
  return { db: drizzle(client, { schema }) as unknown as Db, close: () => client.end() };
}
