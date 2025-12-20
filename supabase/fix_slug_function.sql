-- Fix for "column reference 'slug' is ambiguous" error
-- The variable 'slug' collided with the column name 'slug' in the properties table.
-- We renamed the variable to 'v_slug' to resolve this.

CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  v_slug := base_slug;

  -- Ensure uniqueness by appending counter if needed
  WHILE EXISTS (SELECT 1 FROM properties WHERE properties.slug = v_slug) LOOP
    counter := counter + 1;
    v_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;
