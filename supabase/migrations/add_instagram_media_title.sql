ALTER TABLE instagram_agent_comments
ADD COLUMN IF NOT EXISTS media_title TEXT;

COMMENT ON COLUMN instagram_agent_comments.media_title
IS 'Clean display title derived from the Instagram Reel caption';