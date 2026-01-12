-- Custom SQL migration file, put your code below! --

GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public
  TO app_user;

ALTER DEFAULT PRIVILEGES
  IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLES
  TO app_user;

GRANT USAGE, SELECT
  ON ALL SEQUENCES IN SCHEMA public
  TO app_user;

ALTER DEFAULT PRIVILEGES
  IN SCHEMA public
  GRANT USAGE, SELECT
  ON SEQUENCES
  TO app_user;


/*********************************************************************
 * Function: fn_upsert_conversation_members
 * Purpose : Maintain conversation_members whenever a conversation
 *           is created.
 *********************************************************************/
CREATE OR REPLACE FUNCTION public.fn_upsert_conversation_members()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER               -- bypass RLS; drop if you don’t need it
AS $$
BEGIN
  -------------------------------------------------------------------
  -- Ignore rows that are not tied to a contact (e.g. system events)
  -------------------------------------------------------------------
  IF NEW.contact_id IS NULL THEN
    RETURN NEW;
  END IF;

  -------------------------------------------------------------------
  -- Insert one row per team-member; skip duplicates gracefully
  -------------------------------------------------------------------
  INSERT INTO public.conversation_members  (team_id,
                                            contact_id,
                                            user_id,
                                            last_read_at)
  SELECT NEW.team_id,
         NEW.contact_id,
         tm.user_id,
         '1970-01-01'                       -- default value; tweak freely
  FROM   public.team_members AS tm
  WHERE  tm.organization_id = NEW.team_id
  ON CONFLICT (user_id, contact_id) DO NOTHING;

  RETURN NEW;
END;
$$;



/*********************************************************************
 * Trigger: trg_upsert_conversation_members
 * Fires   : AFTER INSERT ON conversations
 *********************************************************************/
DROP TRIGGER IF EXISTS trg_upsert_conversation_members
ON public.conversations;

CREATE TRIGGER trg_upsert_conversation_members
AFTER INSERT ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.fn_upsert_conversation_members();



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


CREATE OR REPLACE FUNCTION conversation_tsv_trigger() RETURNS trigger AS $$
BEGIN
  -- Extract JSONB fields
  NEW.conversation_search :=
    to_tsvector('english',
      coalesce(NEW.body::text,'')
    )
    -- Append author name via a subquery
    || to_tsvector('english',
      coalesce(
        (SELECT name || ' ' || phone FROM contacts WHERE id = NEW.contact_id),
        ''
      )
    );
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON public.conversations;

-- 3. Attach the trigger to fire on INSERT or UPDATE
CREATE TRIGGER tsvectorupdate
  BEFORE INSERT OR UPDATE
  ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION conversation_tsv_trigger();

-- 4. Backfill existing rows
UPDATE conversations
SET
    conversation_search = to_tsvector(
        'english',
        coalesce(body::text, '')
    ) || to_tsvector(
        'english',
        coalesce(
            (
                SELECT name || ' ' || phone
                FROM contacts
                WHERE
                    id = conversations.contact_id
            ),
            ''
        )
    );