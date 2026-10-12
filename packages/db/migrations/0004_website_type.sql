-- Dastlabki media migratsiyasi qo'llangan bazalarda ham CMS turi mavjud bo'lsin.
ALTER TYPE "public"."content_type" ADD VALUE IF NOT EXISTS 'website';
