-- ADMIN_TZ §3, §4.8, §5.2: CHECK bilan ifodalab bo'lmaydigan qoidalar.

-- 1. Versiya o'zgarmas: faqat holati (status) o'zgarishi mumkin; versiya o'chirilmaydi.
CREATE FUNCTION content_version_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'content_version o''chirilmaydi (tarix saqlanadi)' USING ERRCODE = 'restrict_violation';
  END IF;
  IF NEW.item_id <> OLD.item_id OR NEW.number <> OLD.number OR NEW.data IS DISTINCT FROM OLD.data
     OR NEW.hash <> OLD.hash OR NEW.author_id <> OLD.author_id OR NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'content_version o''zgarmas: faqat status o''zgaradi' USING ERRCODE = 'restrict_violation';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER content_version_immutable BEFORE UPDATE OR DELETE ON content_version
  FOR EACH ROW EXECUTE FUNCTION content_version_immutable();
--> statement-breakpoint

-- 2. Tekshiruvchi versiya muallifi bo'la olmaydi.
CREATE FUNCTION review_not_author() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM content_version v WHERE v.id = NEW.version_id AND v.author_id = NEW.reviewer_id) THEN
    RAISE EXCEPTION 'muallif o''z versiyasini ko''rib chiqa olmaydi' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER review_not_author BEFORE INSERT OR UPDATE ON review
  FOR EACH ROW EXECUTE FUNCTION review_not_author();
--> statement-breakpoint

-- 3. Klinik tasdiq faqat klinik kontentga va muallifdan boshqa kishi tomonidan.
CREATE FUNCTION clinical_attestation_rules() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  is_clinical boolean;
  author bigint;
BEGIN
  SELECT i.clinical, v.author_id INTO is_clinical, author
    FROM content_version v JOIN content_item i ON i.id = v.item_id WHERE v.id = NEW.version_id;
  IF NOT coalesce(is_clinical, false) THEN
    RAISE EXCEPTION 'klinik tasdiq faqat klinik kontentga beriladi' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.reviewer_id IS NOT NULL AND NEW.reviewer_id = author THEN
    RAISE EXCEPTION 'muallif o''z klinik matnini tasdiqlay olmaydi' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER clinical_attestation_rules BEFORE INSERT OR UPDATE ON clinical_attestation
  FOR EACH ROW EXECUTE FUNCTION clinical_attestation_rules();
--> statement-breakpoint

-- 4. Jurnal faqat qo'shiladi.
CREATE FUNCTION audit_event_append_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_event faqat qo''shiladi' USING ERRCODE = 'restrict_violation';
END $$;
--> statement-breakpoint
CREATE TRIGGER audit_event_no_update BEFORE UPDATE OR DELETE ON audit_event
  FOR EACH ROW EXECUTE FUNCTION audit_event_append_only();
--> statement-breakpoint
CREATE TRIGGER audit_event_no_truncate BEFORE TRUNCATE ON audit_event
  FOR EACH STATEMENT EXECUTE FUNCTION audit_event_append_only();
--> statement-breakpoint

-- 5. Oxirgi faol administratorni olib tashlab bo'lmaydi (ADMIN_TZ §2).
CREATE FUNCTION keep_one_admin() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM admin_user u JOIN user_role r ON r.user_id = u.id WHERE r.role = 'admin' AND u.active
  ) THEN
    RAISE EXCEPTION 'kamida bitta faol administrator qolishi kerak' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE TRIGGER keep_one_admin_role AFTER DELETE OR UPDATE ON user_role
  FOR EACH STATEMENT EXECUTE FUNCTION keep_one_admin();
--> statement-breakpoint
CREATE TRIGGER keep_one_admin_user AFTER UPDATE OF active OR DELETE ON admin_user
  FOR EACH STATEMENT EXECUTE FUNCTION keep_one_admin();
