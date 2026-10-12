import { createRequire } from "node:module";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const admin = path.join(root, "apps/admin");
const site = path.join(root, "apps/sayt");
require("@next/env").loadEnvConfig(admin);
const env = { ...process.env };
const mode = process.argv[2] || "start";
const next = require.resolve("next/dist/bin/next");
const run = (args, cwd, extra = {}) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, args, { cwd, env: { ...env, ...extra }, stdio: "inherit", windowsHide: true });
  child.on("error", reject);
  child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Buyruq bajarilmadi (${code})`)));
});
const siteEnv = { CMS_MODE: "dynamic", CMS_API_URL: env.CMS_API_URL || "http://127.0.0.1:3200/api/site-content" };

try {
  if (mode === "build") {
    await run(["scripts/build.mjs"], site, siteEnv);
    await run([next, "build"], admin);
  } else if (mode === "migrate") {
    if (!env.DATABASE_URL) throw new Error("apps/admin/.env.local ichida DATABASE_URL kerak");
    await run([require.resolve("tsx/cli"), "../../packages/db/scripts/migrate.ts"], admin);
  } else if (mode === "start" || mode === "dev") {
    if (!env.DATABASE_URL || !env.ADMIN_ENC_KEY) throw new Error("apps/admin/.env.local ichida DATABASE_URL va ADMIN_ENC_KEY kerak");
    const command = mode === "dev" ? "dev" : "start";
    const children = [
      spawn(process.execPath, [next, command, "-p", "3200", "-H", "127.0.0.1"], { cwd: admin, env: { ...env, PUBLIC_SITE_URL: env.PUBLIC_SITE_URL || "http://localhost:3100" }, stdio: "inherit", windowsHide: true }),
      spawn(process.execPath, [next, command, "-p", "3100", "-H", "127.0.0.1"], { cwd: site, env: { ...env, ...siteEnv }, stdio: "inherit", windowsHide: true }),
    ];
    let stopped = false;
    const stop = () => { if (!stopped) { stopped = true; children.forEach((child) => child.kill()); } };
    for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, stop);
    for (const child of children) {
      child.on("error", (error) => { console.error(error.message); stop(); process.exitCode = 1; });
      child.on("exit", (code) => { stop(); process.exitCode = code ?? 0; });
    }
    console.log("Admin: http://localhost:3200 · Sayt: http://localhost:3100");
  } else throw new Error("Buyruq: build, migrate, start yoki dev");
} catch (error) {
  console.error(error instanceof Error ? error.message : "CMS buyruq xatosi");
  process.exitCode = 1;
}
