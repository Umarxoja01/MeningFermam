// Migratsiyalar: faqat buyruq va testlar uchun (ilova ish paytida import qilmaydi).
import { fileURLToPath } from "node:url";
import * as schema from "./schema";

export const migrationsFolder = fileURLToPath(new URL("../migrations", import.meta.url));

/** Barcha migratsiyalarni qo'llash (oldinga, takroriy chaqiruv xavfsiz). */
export async function migrateDb(url: string) {
  if (url.startsWith("pglite:")) {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    const { migrate } = await import("drizzle-orm/pglite/migrator");
    const dir = url.slice("pglite:".length);
    if (dir) (await import("node:fs")).mkdirSync((await import("node:path")).dirname(dir), { recursive: true });
    const pg = new PGlite(dir || undefined);
    await migrate(drizzle(pg, { schema }), { migrationsFolder });
    await pg.close();
    return;
  }
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const client = postgres(url, { max: 1 });
  await migrate(drizzle(client, { schema }), { migrationsFolder });
  await client.end();
}
