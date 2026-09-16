-- =====================================================
-- Migration: Add instagram_agent_comments Table
-- For tracking Instagram comments processed by the AI agent
-- =====================================================

CREATE TABLE IF NOT EXISTS instagram_agent_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id TEXT UNIQUE NOT NULL,
  comment_text TEXT NOT NULL,
  username TEXT,
  media_id TEXT,
  media_url TEXT,
  category TEXT CHECK (category IN ('simple', 'contact', 'ignore')),
  reply TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'ignored')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE instagram_agent_comments IS 'Instagram comments processed by the AI agent';
COMMENT ON COLUMN instagram_agent_comments.media_url IS 'Instagram post permalink (e.g. https://www.instagram.com/p/<shortcode>/)';
COMMENT ON COLUMN instagram_agent_comments.category IS 'Classification: simple=AI reply, contact=fixed contact reply, ignore=spam/skip';
COMMENT ON COLUMN instagram_agent_comments.status IS 'pending, sent, failed, or ignored';

CREATE INDEX IF NOT EXISTS idx_instagram_agent_comments_created
  ON instagram_agent_comments (created_at DESC);

ALTER TABLE instagram_agent_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view instagram agent comments"
  ON instagram_agent_comments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

CREATE TRIGGER set_instagram_agent_comments_updated_at
  BEFORE UPDATE ON instagram_agent_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();