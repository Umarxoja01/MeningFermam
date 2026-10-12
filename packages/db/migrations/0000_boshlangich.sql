CREATE TYPE "public"."audit_result" AS ENUM('ok', 'denied', 'error');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('contacts', 'features', 'faq', 'problems', 'hero', 'page', 'seo', 'prices', 'clinical-animals', 'clinical-drugs');--> statement-breakpoint
CREATE TYPE "public"."media_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."review_decision" AS ENUM('approved', 'returned');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'editor', 'clinical');--> statement-breakpoint
CREATE TYPE "public"."version_status" AS ENUM('draft', 'review', 'returned', 'approved');--> statement-breakpoint
CREATE TABLE "admin_user" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "admin_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"login" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"totp_secret_enc" text,
	"totp_enabled" boolean DEFAULT false NOT NULL,
	"failed_logins" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_login_unique" UNIQUE("login"),
	CONSTRAINT "admin_user_login_phone" CHECK ("admin_user"."login" ~ '^\+998[0-9]{9}$'),
	CONSTRAINT "admin_user_name_len" CHECK (char_length("admin_user"."name") between 1 and 80),
	CONSTRAINT "admin_user_failed_nonneg" CHECK ("admin_user"."failed_logins" >= 0)
);
--> statement-breakpoint
CREATE TABLE "audit_event" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_event_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" bigint,
	"action" text NOT NULL,
	"object_type" text,
	"object_id" text,
	"version_id" bigint,
	"ip_prefix" text,
	"result" "audit_result" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinical_attestation" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "clinical_attestation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"version_id" bigint NOT NULL,
	"expert_name" text NOT NULL,
	"expert_role" text NOT NULL,
	"source" text NOT NULL,
	"approved_on" date NOT NULL,
	"reviewer_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clinical_attestation_version_id_unique" UNIQUE("version_id"),
	CONSTRAINT "clinical_attestation_fields" CHECK (char_length("clinical_attestation"."expert_name") > 0 and char_length("clinical_attestation"."expert_role") > 0 and char_length("clinical_attestation"."source") > 0)
);
--> statement-breakpoint
CREATE TABLE "content_item" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_item_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"type" "content_type" NOT NULL,
	"key" text NOT NULL,
	"clinical" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_item_type_key" UNIQUE("type","key"),
	CONSTRAINT "content_item_key_len" CHECK (char_length("content_item"."key") between 1 and 80),
	CONSTRAINT "content_item_clinical_type" CHECK ("content_item"."clinical" = ("content_item"."type" in ('clinical-animals', 'clinical-drugs')))
);
--> statement-breakpoint
CREATE TABLE "content_version" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "content_version_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"item_id" bigint NOT NULL,
	"number" integer NOT NULL,
	"data" jsonb NOT NULL,
	"hash" text NOT NULL,
	"status" "version_status" DEFAULT 'draft' NOT NULL,
	"author_id" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_version_item_number" UNIQUE("item_id","number"),
	CONSTRAINT "content_version_id_item" UNIQUE("id","item_id"),
	CONSTRAINT "content_version_number_pos" CHECK ("content_version"."number" >= 1),
	CONSTRAINT "content_version_hash_hex" CHECK ("content_version"."hash" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "login_attempt" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "login_attempt_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"login" text NOT NULL,
	"ip_prefix" text,
	"ok" boolean NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_asset" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "media_asset_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"path" text NOT NULL,
	"kind" "media_kind" NOT NULL,
	"mime" text NOT NULL,
	"bytes" integer NOT NULL,
	"checksum" text NOT NULL,
	"width" integer,
	"height" integer,
	"uploaded_by" bigint NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_asset_path_unique" UNIQUE("path"),
	CONSTRAINT "media_asset_checksum_unique" UNIQUE("checksum"),
	CONSTRAINT "media_mime_allowed" CHECK ("media_asset"."mime" in ('image/jpeg', 'image/png', 'image/webp', 'video/mp4')),
	CONSTRAINT "media_kind_matches_mime" CHECK (("media_asset"."kind" = 'image' and "media_asset"."mime" like 'image/%') or ("media_asset"."kind" = 'video' and "media_asset"."mime" = 'video/mp4')),
	CONSTRAINT "media_size_limit" CHECK ("media_asset"."bytes" > 0 and (("media_asset"."kind" = 'image' and "media_asset"."bytes" <= 5242880) or ("media_asset"."kind" = 'video' and "media_asset"."bytes" <= 31457280))),
	CONSTRAINT "media_checksum_hex" CHECK ("media_asset"."checksum" ~ '^[0-9a-f]{64}$')
);
--> statement-breakpoint
CREATE TABLE "publication" (
	"item_id" bigint PRIMARY KEY NOT NULL,
	"version_id" bigint NOT NULL,
	"published_by" bigint NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"clinical_unverified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recovery_code" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "recovery_code_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"code_hash" text NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recovery_code_user_hash" UNIQUE("user_id","code_hash")
);
--> statement-breakpoint
CREATE TABLE "review" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "review_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"version_id" bigint NOT NULL,
	"reviewer_id" bigint NOT NULL,
	"decision" "review_decision" NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "review_comment_len" CHECK ("review"."comment" is null or char_length("review"."comment") <= 2000)
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "session_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"user_id" bigint NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"ip_prefix" text,
	"user_agent" text,
	CONSTRAINT "session_token_hash_unique" UNIQUE("token_hash"),
	CONSTRAINT "session_expiry_after_create" CHECK ("session"."expires_at" > "session"."created_at")
);
--> statement-breakpoint
CREATE TABLE "user_role" (
	"user_id" bigint NOT NULL,
	"role" "role" NOT NULL,
	CONSTRAINT "user_role_user_id_role_pk" PRIMARY KEY("user_id","role")
);
--> statement-breakpoint
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_attestation" ADD CONSTRAINT "clinical_attestation_version_id_content_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."content_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinical_attestation" ADD CONSTRAINT "clinical_attestation_reviewer_id_admin_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."admin_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_version" ADD CONSTRAINT "content_version_item_id_content_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_item"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_version" ADD CONSTRAINT "content_version_author_id_admin_user_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."admin_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_asset" ADD CONSTRAINT "media_asset_uploaded_by_admin_user_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."admin_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication" ADD CONSTRAINT "publication_item_id_content_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."content_item"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication" ADD CONSTRAINT "publication_published_by_admin_user_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."admin_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publication" ADD CONSTRAINT "publication_version_of_item" FOREIGN KEY ("version_id","item_id") REFERENCES "public"."content_version"("id","item_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recovery_code" ADD CONSTRAINT "recovery_code_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_version_id_content_version_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."content_version"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review" ADD CONSTRAINT "review_reviewer_id_admin_user_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."admin_user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_admin_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_event_at_idx" ON "audit_event" USING btree ("at");--> statement-breakpoint
CREATE INDEX "audit_event_user_idx" ON "audit_event" USING btree ("user_id","at");--> statement-breakpoint
CREATE INDEX "login_attempt_login_idx" ON "login_attempt" USING btree ("login","at");--> statement-breakpoint
CREATE INDEX "login_attempt_ip_idx" ON "login_attempt" USING btree ("ip_prefix","at");--> statement-breakpoint
CREATE INDEX "session_user_idx" ON "session" USING btree ("user_id");