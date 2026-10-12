// Administrator yaratish — faqat serverda, buyruq orqali (ochiq ro'yxatdan o'tish yo'q; ADMIN_TZ §4.1).
//   npm run admin:create -w apps/admin -- --phone +998996180300 --name "Ism"
// Parol yashirin so'raladi (yoki ADMIN_PASSWORD env — faqat avtomat testlar uchun).
// Kerakli env: DATABASE_URL, ADMIN_ENC_KEY. Birinchi kirishda ikki bosqichli kirish sozlanadi.
import { openDb } from "@meningfermam/db";
import { parseArgs } from "node:util";
import { keysFrom } from "../src/lib/auth/crypto";
import { isPwned } from "../src/lib/auth/password";
import { createAdmin, type Role } from "../src/lib/auth/service";

// apps/admin/.env.local (Next bilan bir xil sozlamalar); env'da berilgani ustun
try { process.loadEnvFile(".env.local"); } catch { /* fayl bo'lmasa — env'dan */ }

const { values } = parseArgs({ options: { phone: { type: "string" }, name: { type: "string" }, role: { type: "string", default: "admin" } } });
if (!values.phone || !values.name) {
  console.error('Foydalanish: --phone +998XXXXXXXXX --name "Ism" [--role admin|editor|clinical]');
  process.exit(1);
}
if (!["admin", "editor", "clinical"].includes(values.role!)) {
  console.error("Rol: admin, editor yoki clinical");
  process.exit(1);
}

async function askHidden(q: string): Promise<string> {
  const stdin = process.stdin;
  if (!stdin.isTTY) throw new Error("Parolni yashirin kiritish uchun terminal kerak (yoki ADMIN_PASSWORD)");
  process.stdout.write(q);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  return new Promise((resolve) => {
    let s = "";
    const onData = (ch: string) => {
      if (ch === "\r" || ch === "\n") { stdin.setRawMode(false); stdin.pause(); stdin.off("data", onData); process.stdout.write("\n"); resolve(s); }
      else if (ch === "\u0003") process.exit(1);
      else if (ch === "\u007f" || ch === "\b") s = s.slice(0, -1);
      else s += ch;
    };
    stdin.on("data", onData);
  });
}

const password = process.env.ADMIN_PASSWORD ?? (await (async () => {
  const a = await askHidden("Parol (kamida 12 belgi): ");
  const b = await askHidden("Parol yana bir marta: ");
  if (a !== b) { console.error("Parollar bir xil emas"); process.exit(1); }
  return a;
})());

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL berilmagan"); process.exit(1); }
const { db, close } = await openDb(url);
const r = await createAdmin(
  { db, keys: keysFrom(process.env.ADMIN_ENC_KEY), pwnedCheck: process.env.PWNED_CHECK === "1" ? (pw) => isPwned(pw) : undefined },
  { login: values.phone, name: values.name, password, role: values.role as Role },
);
await close();
if (!r.ok) { console.error("Yaratilmadi:\n - " + r.errors.join("\n - ")); process.exit(1); }
console.log(`Yaratildi (id ${r.id}). Birinchi kirishda telefoningizdagi ilova bilan ikki bosqichli kirishni sozlaysiz.`);
