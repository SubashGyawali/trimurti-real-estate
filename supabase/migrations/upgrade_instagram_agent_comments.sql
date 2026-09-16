-- =====================================================
-- Migration: Upgrade instagram_agent_comments table
-- Add approval workflow, scheduling, and teachings table
-- =====================================================

-- Add new columns to instagram_agent_comments
ALTER TABLE instagram_agent_comments
ADD COLUMN IF NOT EXISTS proposed_reply TEXT,
ADD COLUMN IF NOT EXISTS confidence REAL,
ADD COLUMN IF NOT EXISTS decision_reason TEXT,
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_source TEXT,
ADD COLUMN IF NOT EXISTS admin_action TEXT,
ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS hidden_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS property_title TEXT,
ADD COLUMN IF NOT EXISTS property_price INTEGER,
ADD COLUMN IF NOT EXISTS property_price_text TEXT,
ADD COLUMN IF NOT EXISTS property_listing_type TEXT CHECK (property_listing_type IN ('sale', 'rent')),
ADD COLUMN IF NOT EXISTS response_language TEXT,
ADD COLUMN IF NOT EXISTS response_style TEXT;

-- Update status CHECK constraint to include new statuses
ALTER TABLE instagram_agent_comments DROP CONSTRAINT IF EXISTS instagram_agent_comments_status_check;
ALTER TABLE instagram_agent_comments ADD CONSTRAINT instagram_agent_comments_status_check
CHECK (status IN ('pending', 'queued', 'awaiting_approval', 'approved', 'sent', 'failed', 'ignored'));

-- Add admin UPDATE policy (SELECT already exists from original migration)
DROP POLICY IF EXISTS "Admins can update instagram agent comments"
  ON instagram_agent_comments;

CREATE POLICY "Admins can update instagram agent comments"
  ON instagram_agent_comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Add index for scheduled posts
CREATE INDEX IF NOT EXISTS idx_instagram_agent_comments_scheduled
  ON instagram_agent_comments (status, scheduled_for)
  WHERE status IN ('queued', 'pending');

-- Add index for approved comments
CREATE INDEX IF NOT EXISTS idx_instagram_agent_comments_approved
  ON instagram_agent_comments (admin_reviewed_at)
  WHERE status = 'approved';

-- =====================================================
-- New table: instagram_agent_teachings
-- Admin-written rules for the agent
-- =====================================================

CREATE TABLE IF NOT EXISTS instagram_agent_teachings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE instagram_agent_teachings IS 'Admin teachings/rules for the Instagram AI agent';
COMMENT ON COLUMN instagram_agent_teachings.rule IS 'Natural language rule for the agent to follow';

CREATE INDEX IF NOT EXISTS idx_instagram_agent_teachings_active
  ON instagram_agent_teachings (created_at DESC)
  WHERE is_active = TRUE;

ALTER TABLE instagram_agent_teachings ENABLE ROW LEVEL SECURITY;

-- Admin full access
DROP POLICY IF EXISTS "Admins can view teachings"
  ON instagram_agent_teachings;

CREATE POLICY "Admins can view teachings"
  ON instagram_agent_teachings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can insert teachings"
  ON instagram_agent_teachings;

CREATE POLICY "Admins can insert teachings"
  ON instagram_agent_teachings FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can update teachings"
  ON instagram_agent_teachings;

CREATE POLICY "Admins can update teachings"
  ON instagram_agent_teachings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can delete teachings"
  ON instagram_agent_teachings;

CREATE POLICY "Admins can delete teachings"
  ON instagram_agent_teachings FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_instagram_agent_teachings_updated_at
  ON instagram_agent_teachings;

CREATE TRIGGER set_instagram_agent_teachings_updated_at
  BEFORE UPDATE ON instagram_agent_teachings
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- These rules are consumed by the external Instagram worker. Keep them explicit
-- so metadata and reply requirements cannot be inferred inconsistently.
INSERT INTO instagram_agent_teachings (rule, is_active)
SELECT rule, TRUE
FROM (VALUES
  ('Always reply in warm, concise Hinglish using Roman Hindi mixed with simple English. Never reply in fully formal English unless the commenter writes entirely in English and the meaning would otherwise be unclear.'),
  ('For any price, cost, rate, or budget question, include the exact property_price from the matched property context. Never replace a known price with “DM us”, “chat on WhatsApp”, or a generic sales response.'),
  ('Every processed Reel must preserve media_url as the Instagram permalink and media_title as the clean display title derived from the Reel caption.'),
  ('Vary the reply wording naturally. Do not reuse the same template for consecutive comments; keep the intent and facts consistent while changing the opening and closing.'),
  ('If no property match or exact price is available, say that the exact price is not available yet and ask the user to WhatsApp, rather than inventing a price.')
) AS defaults(rule)
WHERE NOT EXISTS (
  SELECT 1 FROM instagram_agent_teachings existing WHERE existing.rule = defaults.rule
);