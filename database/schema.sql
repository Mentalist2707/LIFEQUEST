-- Tables are also initialized by the Next.js API on first request.
CREATE TABLE IF NOT EXISTS lifequest_users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  failed_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz
);
CREATE TABLE IF NOT EXISTS lifequest_sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES lifequest_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lifequest_sessions_expiry ON lifequest_sessions(expires_at);
CREATE TABLE IF NOT EXISTS lifequest_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Existing row with id='personal' (from old single-user LIFEQUEST) is preserved.
-- New accounts store their own state at id='user:<uuid>'.
