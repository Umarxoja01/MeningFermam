ALTER TYPE "public"."content_type" ADD VALUE IF NOT EXISTS 'website';
--> statement-breakpoint
-- Rasm baytlari PostgreSQL'da: Vercel funksiyasining vaqtinchalik diskiga bog'lanmaydi.
ALTER TABLE "media_asset" ADD COLUMN "content_bytes" text;
