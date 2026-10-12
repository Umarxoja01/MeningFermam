// Bir martalik import (ADMIN_TZ §7.5): saytdagi joriy aloqa, funksiyalar holati va savol-javob bazaga 1-versiya
// sifatida yoziladi va nashr qilinadi. Allaqachon versiyasi bor kontentga tegilmaydi.
//   npm run content:seed -w apps/admin -- --by +998XXXXXXXXX   (shu administrator nomidan)
import { openDb, schema } from "@meningfermam/db";
import { eq } from "drizzle-orm";
import { parseArgs } from "node:util";
import { contacts } from "../../sayt/src/content/aloqa";
import { features } from "../../sayt/src/content/holat";
import { faqGroups } from "../../sayt/src/content/savollar";
import { defaultWebsite } from "../../sayt/src/content/cms-defaults";
import { normalizePhone } from "../src/lib/auth/service";
import { getState, publish, saveDraft, type Actor } from "../src/lib/content/service";

try { process.loadEnvFile(".env.local"); } catch { /* env'dan */ }

const { values } = parseArgs({ options: { by: { type: "string" } } });
const login = values.by ? normalizePhone(values.by) : null;
const url = process.env.DATABASE_URL;
if (!login || !url) {
  console.error("Foydalanish: DATABASE_URL berilgan bo'lsin; --by +998XXXXXXXXX (mavjud administrator)");
  process.exit(1);
}
const { db, close } = await openDb(url);
const [u] = await db.select().from(schema.adminUser).where(eq(schema.adminUser.login, login));
const roles = u ? (await db.select().from(schema.userRole).where(eq(schema.userRole.userId, u.id))).map((r) => r.role) : [];
if (!u || !roles.includes("admin")) {
  console.error("Bunday administrator topilmadi");
  await close();
  process.exit(1);
}
const actor: Actor = { id: u.id, roles };
const items = [
  { type: "website", data: defaultWebsite, name: "Sayt boshqaruvi" },
  { type: "contacts", data: contacts, name: "Aloqa" },
  { type: "features", data: features, name: "Funksiyalar holati" },
  { type: "faq", data: faqGroups, name: "Savol-javob" },
] as const;
for (const it of items) {
  const st = await getState({ db }, it.type, "asosiy");
  if (st.latest) { console.log(`${it.name}: allaqachon bor (v${st.latest.number}) — tegilmadi`); continue; }
  const s = await saveDraft({ db }, actor, { type: it.type, key: "asosiy", data: it.data, baseNumber: 0 });
  if (!s.ok) { console.error(`${it.name}: saqlanmadi`, s); process.exitCode = 1; continue; }
  const p = await publish({ db }, actor, { type: it.type, key: "asosiy", number: s.number });
  console.log(`${it.name}: ${p.ok ? `v${s.number} nashr qilindi` : `nashr qilinmadi (${p.error})`}`);
}
await close();
