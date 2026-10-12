CREATE TYPE "public"."session_stage" AS ENUM('mfa', 'setup', 'full');--> statement-breakpoint
ALTER TABLE "admin_user" DROP CONSTRAINT "admin_user_failed_nonneg";--> statement-breakpoint
ALTER TABLE "admin_user" ADD COLUMN "lock_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_user" ADD COLUMN "totp_last_step" bigint;--> statement-breakpoint
ALTER TABLE "admin_user" ADD COLUMN "password_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "stage" "session_stage" DEFAULT 'full' NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "mfa_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_failed_nonneg" CHECK ("admin_user"."failed_logins" >= 0 and "admin_user"."lock_count" >= 0);