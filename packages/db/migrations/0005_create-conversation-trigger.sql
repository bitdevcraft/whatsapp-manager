-- Custom SQL migration file, put your code below! --
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