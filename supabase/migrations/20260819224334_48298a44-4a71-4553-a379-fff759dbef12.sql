CREATE OR REPLACE FUNCTION public.increment_chat_usage()
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  INSERT INTO public.chat_usage (user_id, reference_date, message_count)
  VALUES (auth.uid(), CURRENT_DATE, 1)
  ON CONFLICT (user_id, reference_date)
  DO UPDATE SET message_count = public.chat_usage.message_count + 1, updated_at = now()
  RETURNING message_count INTO new_count;
  RETURN new_count;
END;
$function$;

REVOKE ALL ON FUNCTION public.increment_chat_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_chat_usage() TO authenticated;