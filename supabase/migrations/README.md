# Supabase Migrations

Apply in order in **Supabase SQL Editor** (or `psql` / `supabase db push` if you use the CLI). All migrations are idempotent (`IF NOT EXISTS` / `DROP POLICY IF EXISTS` where needed), so re-running is safe.

## Order

1. `add_avatar_url.sql` — adds `profiles.avatar_url` (Google OAuth avatar).
2. `add_home_gallery_images.sql` — `home_gallery_images` + RLS.
3. `add_instagram_agent_comments.sql` — base `instagram_agent_comments` table (comment_id UNIQUE, category/status CHECK, RLS admin SELECT, `handle_updated_at()` trigger).
4. `upgrade_instagram_agent_comments.sql` — approval workflow + scheduling: `proposed_reply, confidence, decision_reason, scheduled_for, reply_source, admin_action, admin_reviewed_at/by, hidden_at/by, property_* , response_language/style`, widens `status` to `pending | queued | awaiting_approval | approved | sent | failed | ignored`, adds admin UPDATE policy.
5. `add_instagram_media_title.sql` — `media_title` (clean Reel caption title).
6. `fix_google_oauth_profile.sql` — trigger fix for Google sign-up profile row.

> Canonical schema is `supabase/schema.sql` (all tables/policies in one file). Migrations apply the same diffs incrementally — keep both in sync when you add a column. App types at `src/types/database.ts` must match (see `InstagramAgentComment`).

## How to apply

**SQL Editor (easiest):**
- Open Supabase Dashboard → SQL Editor → New query → paste the migration file → Run.
- Check `Table Editor → instagram_agent_comments` appears, then `SELECT * FROM instagram_agent_comments LIMIT 1;` should succeed as admin.

**CLI:**
```bash
supabase link --project-ref <ref>
supabase db push   # if migrations are under supabase/migrations/
# or:
psql "postgresql://postgres.<ref>:<pass>@db.<ref>.supabase.co:5432/postgres" -f supabase/migrations/add_instagram_agent_comments.sql
```

## Verify

```sql
select column_name, data_type from information_schema.columns
where table_name='instagram_agent_comments' order by ordinal_position;

select policyname, cmd from pg_policies where tablename='instagram_agent_comments';
-- expect: "Admins can view ..." (SELECT) + "Admins can update ..." (UPDATE)
```

## Notes

- RLS: **admin SELECT + admin UPDATE only** (service_role bypasses RLS for the Python agent's writes). Never add a public INSERT policy.
- `comment_id` is UNIQUE — webhook upserts with `on_conflict=comment_id` (`Prefer: resolution=merge-duplicates`).
- `status` flow: `pending → queued | awaiting_approval → approved → sent | failed | ignored` (also direct `failed/ignored` from triage).
- Agent SQLite `agent.db` mirrors these columns via `database.py` idempotent `ALTER TABLE ... ADD COLUMN` in `init_db()` — keep names aligned.
