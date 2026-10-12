// Migratsiyalarni qo'llash: DATABASE_URL=… npm run migrate -w packages/db
import { migrateDb } from "../src/migrate";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL berilmagan");
  process.exit(1);
}
await migrateDb(url);
console.log("Migratsiyalar qo'llandi.");
