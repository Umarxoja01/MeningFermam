import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
require("@next/env").loadEnvConfig(process.cwd());
const build = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], { stdio: "inherit" });
if (build.status !== 0) process.exit(build.status ?? 1);
if (process.env.CMS_MODE !== "dynamic") {
  const flatten = spawnSync(process.execPath, ["scripts/flatten-segments.mjs", "out"], { stdio: "inherit" });
  process.exit(flatten.status ?? 1);
}
