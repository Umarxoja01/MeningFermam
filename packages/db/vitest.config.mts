import { defineConfig } from "vitest/config";

// PGlite (WASM PostgreSQL) bilan: tizimga baza o'rnatish shart emas.
export default defineConfig({ test: { include: ["tests/**/*.test.ts"], testTimeout: 30_000, hookTimeout: 60_000 } });
