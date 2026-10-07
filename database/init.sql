CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content jsonb NOT NULL,
  plain_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notes_plain_text_length_check CHECK (char_length(plain_text) <= 120),
  CONSTRAINT notes_plain_text_not_blank_check CHECK (char_length(btrim(plain_text)) > 0)
);

CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC);
