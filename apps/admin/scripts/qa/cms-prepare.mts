import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { openDb } from "@meningfermam/db";
import { migrateDb } from "@meningfermam/db/migrate";
import { keysFrom } from "../../src/lib/auth/crypto";
import { createAdmin } from "../../src/lib/auth/service";
import { publish, saveDraft } from "../../src/lib/content/service";
import { defaultWebsite } from "../../../sayt/src/content/cms-defaults";
import { contacts } from "../../../sayt/src/content/aloqa";
import { features } from "../../../sayt/src/content/holat";
import { faqGroups } from "../../../sayt/src/content/savollar";

// Har safar yangi, alohida test bazasi; mavjud baza yoki haqiqiy parollar o'zgartirilmaydi.
const dataRoot = path.resolve(".data");
const dir = path.join(dataRoot, `qa-cms-${Date.now()}`);
if (!dir.startsWith(dataRoot + path.sep) || existsSync(dir)) throw new Error("Yangi test bazasi manzili kerak");
mkdirSync(dataRoot, { recursive: true });
const url = `pglite:${dir.replaceAll("\\", "/")}`;
const key = randomBytes(32).toString("base64");
const login = "+998900000111";
const password = "Sinov-yaylov-parol-2026";
await migrateDb(url);
const { db, close } = await openDb(url);
try {
  const user = await createAdmin({ db, keys: keysFrom(key) }, { login, password, name: "CMS Sinov" });
  if (!user.ok) throw new Error(user.errors.join(", "));
  const actor = { id: user.id, roles: ["admin" as const] };
  for (const [type, data] of [["website", defaultWebsite], ["contacts", contacts], ["features", features], ["faq", faqGroups]] as const) {
    const saved = await saveDraft({ db }, actor, { type, key: "asosiy", data, baseNumber: 0 });
    if (!saved.ok) throw new Error(`Test qoralamasi saqlanmadi: ${type}`);
    const result = await publish({ db }, actor, { type, key: "asosiy", number: saved.number });
    if (!result.ok) throw new Error(`Test nashri bajarilmadi: ${type}`);
  }
  const config = { DATABASE_URL: url, ADMIN_ENC_KEY: key, QA_LOGIN: login, QA_PASSWORD: password };
  writeFileSync(path.join(dataRoot, "qa-cms-config.json"), JSON.stringify(config));
  console.log("Alohida CMS test bazasi va 4 nashr tayyorlandi.");
} finally { await close(); }
