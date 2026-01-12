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
