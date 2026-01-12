-- 1) Normalization function
CREATE OR REPLACE FUNCTION contacts_normalize_phone_tg()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- strip all non-digits; keep empty string if NULL
  NEW.phone := regexp_replace(coalesce(NEW.phone, ''), '\D', '', 'g');

  -- If you want to skip work on updates where phone didn't change:
  IF TG_OP = 'UPDATE' AND NEW.phone IS NOT DISTINCT FROM OLD.phone THEN
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Trigger: run before INSERT and before UPDATE of the phone column
DROP TRIGGER IF EXISTS contacts_normalize_phone_biu ON contacts;
CREATE TRIGGER contacts_normalize_phone_biu
BEFORE INSERT OR UPDATE OF phone ON contacts
FOR EACH ROW
EXECUTE FUNCTION contacts_normalize_phone_tg();
