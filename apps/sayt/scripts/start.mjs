import { createRequire } from "node:module";
import { spawn } from "node:child_process";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const args = process.env.CMS_MODE === "dynamic"
  ? [require.resolve("next/dist/bin/next"), "start", "-p", process.env.PORT || "3100"]
  : ["scripts/serve-static.mjs", "out", process.env.PORT || "3100"];
const child = spawn(process.execPath, args, { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
