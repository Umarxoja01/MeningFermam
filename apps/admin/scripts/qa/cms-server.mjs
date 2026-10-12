// Faqat cms-prepare yaratgan alohida baza bilan ikkita production QA serveri.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
const admin = path.resolve(import.meta.dirname, "../..");
const site = path.resolve(admin, "../sayt");
const config = JSON.parse(fs.readFileSync(path.join(admin, ".data/qa-cms-config.json"), "utf8"));
if (!/^pglite:.*qa-cms-\d+$/.test(config.DATABASE_URL ?? "")) throw new Error("Alohida QA bazasi kerak");
const next = require.resolve("next/dist/bin/next");
const children = [
  spawn(process.execPath, [next, "start", "-p", "4320", "-H", "127.0.0.1"], {
    cwd: admin, stdio: "inherit", windowsHide: true,
    env: { ...process.env, DATABASE_URL: config.DATABASE_URL, ADMIN_ENC_KEY: config.ADMIN_ENC_KEY, PWNED_CHECK: "0", PUBLIC_SITE_URL: "http://localhost:4310" },
  }),
  spawn(process.execPath, [next, "start", "-p", "4310", "-H", "127.0.0.1"], {
    cwd: site, stdio: "inherit", windowsHide: true,
    env: { ...process.env, CMS_MODE: "dynamic", CMS_API_URL: "http://127.0.0.1:4320/api/site-content" },
  }),
];
let stopped = false;
const stop = () => { if (!stopped) { stopped = true; children.forEach((child) => child.kill()); } };
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, stop);
for (const child of children) {
  child.on("error", (error) => { console.error(error.message); process.exitCode = 1; stop(); });
  child.on("exit", (code) => { process.exitCode = code ?? 0; stop(); });
}
