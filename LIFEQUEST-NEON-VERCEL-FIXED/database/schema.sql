-- Optional: the API creates this table automatically on its first successful request.
CREATE TABLE IF NOT EXISTS lifequest_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  revision bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
