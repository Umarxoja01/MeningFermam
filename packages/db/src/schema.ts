// Admin panel bazasi (ADMIN_TZ §6). PostgreSQL; Drizzle. Fermer ma'lumotlari bu bazaga kirmaydi.
// Qo'shimcha qoidalar (trigger'lar) migrations/0001_*.sql da: versiya o'zgarmasligi, tekshiruvchi ≠ muallif,
// klinik tasdiq faqat klinik kontentga, jurnal faqat qo'shiladi.
import { contentTypeNames, type ContentType } from "@meningfermam/content";
import { sql } from "drizzle-orm";
import { bigint, boolean, check, date, foreignKey, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, unique } from "drizzle-orm/pg-core";

const id = () => bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity();
const ref = (name: string) => bigint(name, { mode: "number" });
const at = (name: string) => timestamp(name, { withTimezone: true });
const createdAt = () => at("created_at").notNull().defaultNow();

export const roleEnum = pgEnum("role", ["admin", "editor", "clinical"]);
export const contentTypeEnum = pgEnum("content_type", contentTypeNames as [ContentType, ...ContentType[]]);
export const versionStatusEnum = pgEnum("version_status", ["draft", "review", "returned", "approved"]);
export const reviewDecisionEnum = pgEnum("review_decision", ["approved", "returned"]);
export const mediaKindEnum = pgEnum("media_kind", ["image", "video"]);
export const auditResultEnum = pgEnum("audit_result", ["ok", "denied", "error"]);
/** Sessiya bosqichi: "mfa" — parol to'g'ri, kod kutilmoqda; "setup" — ikki bosqichli kirish sozlanmoqda; "full" — to'liq kirgan. */
export const sessionStageEnum = pgEnum("session_stage", ["mfa", "setup", "full"]);

/** Admin foydalanuvchisi. Login — telefon raqami (S-1). Ochiq ro'yxatdan o'tish yo'q. */
export const adminUser = pgTable("admin_user", {
  id: id(),
  login: text("login").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  /** TOTP siri — ilova kaliti bilan shifrlangan holda. */
  totpSecretEnc: text("totp_secret_enc"),
  totpEnabled: boolean("totp_enabled").notNull().default(false),
  failedLogins: integer("failed_logins").notNull().default(0),
  /** Ketma-ket bloklar soni: har blok oldingisidan 2 baravar uzun (ADMIN_TZ §4.1). */
  lockCount: integer("lock_count").notNull().default(0),
  lockedUntil: at("locked_until"),
  /** Oxirgi qabul qilingan TOTP qadami: bitta kodni ikki marta ishlatib bo'lmaydi. */
  totpLastStep: bigint("totp_last_step", { mode: "number" }),
  passwordChangedAt: at("password_changed_at"),
  lastLoginAt: at("last_login_at"),
  createdAt: createdAt(),
}, (t) => [
  check("admin_user_login_phone", sql`${t.login} ~ '^\\+998[0-9]{9}$'`),
  check("admin_user_name_len", sql`char_length(${t.name}) between 1 and 80`),
  check("admin_user_failed_nonneg", sql`${t.failedLogins} >= 0 and ${t.lockCount} >= 0`),
]);

export const userRole = pgTable("user_role", {
  userId: ref("user_id").notNull().references(() => adminUser.id, { onDelete: "cascade" }),
  role: roleEnum("role").notNull(),
}, (t) => [primaryKey({ columns: [t.userId, t.role] })]);

/** Ikki bosqichli kirish uchun zaxira kodlar (xeshlangan). */
export const recoveryCode = pgTable("recovery_code", {
  id: id(),
  userId: ref("user_id").notNull().references(() => adminUser.id, { onDelete: "cascade" }),
  codeHash: text("code_hash").notNull(),
  usedAt: at("used_at"),
  createdAt: createdAt(),
}, (t) => [unique("recovery_code_user_hash").on(t.userId, t.codeHash)]);

/** Serverdagi sessiya: brauzerda faqat tasodifiy token, bu yerda uning xeshi. */
export const session = pgTable("session", {
  id: id(),
  userId: ref("user_id").notNull().references(() => adminUser.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  stage: sessionStageEnum("stage").notNull().default("full"),
  /** "mfa" bosqichidagi noto'g'ri kod urinishlari. */
  mfaAttempts: integer("mfa_attempts").notNull().default(0),
  createdAt: createdAt(),
  lastSeenAt: at("last_seen_at").notNull().defaultNow(),
  expiresAt: at("expires_at").notNull(),
  ipPrefix: text("ip_prefix"),
  userAgent: text("user_agent"),
}, (t) => [
  index("session_user_idx").on(t.userId),
  check("session_expiry_after_create", sql`${t.expiresAt} > ${t.createdAt}`),
]);

/** Kirish urinishlari (cheklov uchun). */
export const loginAttempt = pgTable("login_attempt", {
  id: id(),
  login: text("login").notNull(),
  ipPrefix: text("ip_prefix"),
  ok: boolean("ok").notNull(),
  at: at("at").notNull().defaultNow(),
}, (t) => [index("login_attempt_login_idx").on(t.login, t.at), index("login_attempt_ip_idx").on(t.ipPrefix, t.at)]);

/** Kontent birligi: masalan (contacts, main), (page, /yem-rejasi). */
export const contentItem = pgTable("content_item", {
  id: id(),
  type: contentTypeEnum("type").notNull(),
  key: text("key").notNull(),
  clinical: boolean("clinical").notNull().default(false),
  createdAt: createdAt(),
}, (t) => [
  unique("content_item_type_key").on(t.type, t.key),
  check("content_item_key_len", sql`char_length(${t.key}) between 1 and 80`),
  // klinik turlar doim klinik deb belgilanadi (§5.2 qoidalari chetlab o'tilmasin)
  check("content_item_clinical_type", sql`${t.clinical} = (${t.type} in ('clinical-animals', 'clinical-drugs'))`),
]);

/** Versiya — o'zgarmas yozuv (faqat holati o'zgaradi; trigger). */
export const contentVersion = pgTable("content_version", {
  id: id(),
  itemId: ref("item_id").notNull().references(() => contentItem.id, { onDelete: "restrict" }),
  number: integer("number").notNull(),
  data: jsonb("data").notNull(),
  hash: text("hash").notNull(),
  status: versionStatusEnum("status").notNull().default("draft"),
  authorId: ref("author_id").notNull().references(() => adminUser.id, { onDelete: "restrict" }),
  createdAt: createdAt(),
}, (t) => [
  unique("content_version_item_number").on(t.itemId, t.number),
  unique("content_version_id_item").on(t.id, t.itemId),
  check("content_version_number_pos", sql`${t.number} >= 1`),
  check("content_version_hash_hex", sql`${t.hash} ~ '^[0-9a-f]{64}$'`),
]);

/** Joriy nashr: har kontent birligida bittadan; versiya aynan shu birlikka tegishli bo'lishi shart. */
export const publication = pgTable("publication", {
  itemId: ref("item_id").primaryKey().references(() => contentItem.id, { onDelete: "restrict" }),
  versionId: ref("version_id").notNull(),
  publishedBy: ref("published_by").notNull().references(() => adminUser.id, { onDelete: "restrict" }),
  publishedAt: at("published_at").notNull().defaultNow(),
  /** Klinik kontent mutaxassis tasdig'isiz nashr qilingan (ADMIN_TZ §5.2, S-2). */
  clinicalUnverified: boolean("clinical_unverified").notNull().default(false),
}, (t) => [
  foreignKey({ name: "publication_version_of_item", columns: [t.versionId, t.itemId], foreignColumns: [contentVersion.id, contentVersion.itemId] }).onDelete("restrict"),
]);

export const review = pgTable("review", {
  id: id(),
  versionId: ref("version_id").notNull().references(() => contentVersion.id, { onDelete: "restrict" }),
  reviewerId: ref("reviewer_id").notNull().references(() => adminUser.id, { onDelete: "restrict" }),
  decision: reviewDecisionEnum("decision").notNull(),
  comment: text("comment"),
  createdAt: createdAt(),
}, (t) => [check("review_comment_len", sql`${t.comment} is null or char_length(${t.comment}) <= 2000`)]);

/** Klinik kontent uchun mutaxassis tasdig'i (ADMIN_TZ §5.2). */
export const clinicalAttestation = pgTable("clinical_attestation", {
  id: id(),
  versionId: ref("version_id").notNull().unique().references(() => contentVersion.id, { onDelete: "restrict" }),
  expertName: text("expert_name").notNull(),
  expertRole: text("expert_role").notNull(),
  source: text("source").notNull(),
  approvedOn: date("approved_on").notNull(),
  reviewerId: ref("reviewer_id").references(() => adminUser.id, { onDelete: "restrict" }),
  createdAt: createdAt(),
}, (t) => [check("clinical_attestation_fields", sql`char_length(${t.expertName}) > 0 and char_length(${t.expertRole}) > 0 and char_length(${t.source}) > 0`)]);

export const mediaAsset = pgTable("media_asset", {
  id: id(),
  path: text("path").notNull().unique(),
  kind: mediaKindEnum("kind").notNull(),
  mime: text("mime").notNull(),
  bytes: integer("bytes").notNull(),
  checksum: text("checksum").notNull().unique(),
  /** Admin yuklagan rasm: base64 baytlar. Eski tashqi fayllarda null. */
  contentBytes: text("content_bytes"),
  width: integer("width"),
  height: integer("height"),
  uploadedBy: ref("uploaded_by").notNull().references(() => adminUser.id, { onDelete: "restrict" }),
  deletedAt: at("deleted_at"),
  createdAt: createdAt(),
}, (t) => [
  // ADMIN_TZ §4.6: SVG yo'q; rasm ≤ 5 MB, video ≤ 30 MB
  check("media_mime_allowed", sql`${t.mime} in ('image/jpeg', 'image/png', 'image/webp', 'video/mp4')`),
  check("media_kind_matches_mime", sql`(${t.kind} = 'image' and ${t.mime} like 'image/%') or (${t.kind} = 'video' and ${t.mime} = 'video/mp4')`),
  check("media_size_limit", sql`${t.bytes} > 0 and ((${t.kind} = 'image' and ${t.bytes} <= 5242880) or (${t.kind} = 'video' and ${t.bytes} <= 31457280))`),
  check("media_checksum_hex", sql`${t.checksum} ~ '^[0-9a-f]{64}$'`),
]);

/** Jurnal: faqat qo'shiladi (trigger). Parol, token, kod yozilmaydi. */
export const auditEvent = pgTable("audit_event", {
  id: id(),
  at: at("at").notNull().defaultNow(),
  userId: ref("user_id").references(() => adminUser.id, { onDelete: "restrict" }),
  action: text("action").notNull(),
  objectType: text("object_type"),
  objectId: text("object_id"),
  versionId: ref("version_id"),
  ipPrefix: text("ip_prefix"),
  result: auditResultEnum("result").notNull(),
}, (t) => [index("audit_event_at_idx").on(t.at), index("audit_event_user_idx").on(t.userId, t.at)]);
