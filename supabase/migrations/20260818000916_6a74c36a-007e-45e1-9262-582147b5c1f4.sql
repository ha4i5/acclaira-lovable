REVOKE EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text, text, jsonb) FROM authenticated, anon, public;
REVOKE EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text, jsonb) FROM authenticated, anon, public;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_credits(uuid, integer, text, jsonb) TO service_role;