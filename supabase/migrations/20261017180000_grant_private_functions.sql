-- Apply this after 20261017120000_cms_schema.sql on a database that already exists.
-- It does not create, drop, or rewrite tables.
-- Authenticated administrators need EXECUTE on the private functions that
-- triggers and check constraints call. Those privileges were missing, so
-- saves and image records failed with "permission denied for function".

grant execute on function private.touch_updated_at() to authenticated;
grant execute on function private.text_ok(text, integer) to authenticated;
