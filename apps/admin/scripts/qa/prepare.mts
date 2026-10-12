// E2E uchun toza test bazasi: DATABASE_URL (pglite:./.data/qa) o'chiriladi, migratsiya qilinadi, 4 ta sinov foydalanuvchisi.
// Ishlatish: DATABASE_URL=pglite:./.data/qa ADMIN_ENC_KEY=… npm run qa:prepare -w apps/admin
import { openDb } from "@meningfermam/db";
import { migrateDb } from "@meningfermam/db/migrate";
import { rmSync } from "node:fs";
import { keysFrom } from "../../src/lib/auth/crypto";
import { createAdmin } from "../../src/lib/auth/service";
import { publish, saveDraft } from "../../src/lib/content/service";
import { contacts } from "../../../sayt/src/content/aloqa";
import { features } from "../../../sayt/src/content/holat";
import { faqGroups } from "../../../sayt/src/content/savollar";

const url = process.env.DATABASE_URL ?? "";
if (!url.startsWith("pglite:./.data/")) {
  console.error("Faqat lokal sinov bazasi: DATABASE_URL=pglite:./.data/<nom>");
  process.exit(1);
}
rmSync(url.slice("pglite:".length), { recursive: true, force: true });
await migrateDb(url);
const { db, close } = await openDb(url);
const password = process.env.QA_PASSWORD ?? "Sinov-yaylov-parol-2026";
const ctx = { db, keys: keysFrom(process.env.ADMIN_ENC_KEY) };
const users = [
  { login: "+998900000001", name: "Sinov Egasi" },
  { login: "+998900000002", name: "Sinov Blok" },
  { login: "+998900000003", name: "Sinov Parol" },
  { login: "+998900000004", name: "Sinov Chiqish" },
  { login: "+998900000005", name: "Sinov Muharrir", role: "editor" as const },
];
const ids: number[] = [];
for (const u of users) {
  const r = await createAdmin(ctx, { ...u, password });
  if (!r.ok) throw new Error(r.errors.join(", "));
  ids.push(r.id);
}
// saytdagi joriy kontent 1-versiya sifatida (content:seed bilan bir xil)
const owner = { id: ids[0]!, roles: ["admin" as const] };
for (const [type, data] of [["contacts", contacts], ["features", features], ["faq", faqGroups]] as const) {
  const s = await saveDraft({ db }, owner, { type, key: "asosiy", data, baseNumber: 0 });
  if (!s.ok) throw new Error(`${type}: ${JSON.stringify(s)}`);
  const p = await publish({ db }, owner, { type, key: "asosiy", number: s.number });
  if (!p.ok) throw new Error(`${type}: ${JSON.stringify(p)}`);
}
await close();
console.log(JSON.stringify({ ok: true, users: users.map((u) => u.login) }));
