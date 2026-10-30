-- affiliate_clicks was created without RLS, leaving it readable/writable with the public
-- anon key. No policies are added: only the service role (used by /api/go) may access it.
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
