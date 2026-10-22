-- Apply after configure-blog-privacy.mjs --schema-only. No content is published.
BEGIN;
CREATE UNIQUE INDEX IF NOT EXISTS pc_blog_file_links_post_file ON pc_blog_file_links(post_id, file_id);
CREATE INDEX IF NOT EXISTS pc_blog_file_links_file ON pc_blog_file_links(file_id);
CREATE OR REPLACE FUNCTION pc_blog_referenced_files(cover json, sections json)
RETURNS SETOF uuid LANGUAGE sql IMMUTABLE AS $$
  SELECT DISTINCT matches[1]::uuid FROM regexp_matches(
    COALESCE(cover::text, '') || ' ' || COALESCE(sections::text, ''),
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', 'g'
  ) AS matches;
$$;
CREATE OR REPLACE FUNCTION pc_blog_sync_file_links()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP <> 'DELETE' THEN
    DELETE FROM pc_blog_file_links WHERE post_id = NEW.id;
    INSERT INTO pc_blog_file_links(post_id, file_id)
      SELECT NEW.id, f.id FROM directus_files f
      WHERE f.id IN (SELECT pc_blog_referenced_files(NEW.cover_image, NEW.sections));
    UPDATE directus_files SET pc_blog_managed = true
      WHERE id IN (SELECT file_id FROM pc_blog_file_links WHERE post_id = NEW.id);
  END IF;
  UPDATE directus_files f SET pc_blog_public_at = (
    SELECT MIN(p.published_at) FROM pc_blog_file_links l JOIN pc_blog_posts p ON p.id = l.post_id
    WHERE l.file_id = f.id AND p.published = true
  ) WHERE f.pc_blog_managed = true;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS pc_blog_sync_file_links ON pc_blog_posts;
CREATE TRIGGER pc_blog_sync_file_links AFTER INSERT OR UPDATE OR DELETE
  ON pc_blog_posts FOR EACH ROW EXECUTE FUNCTION pc_blog_sync_file_links();
DELETE FROM pc_blog_file_links;
INSERT INTO pc_blog_file_links(post_id, file_id)
  SELECT DISTINCT p.id, f.id FROM pc_blog_posts p
  CROSS JOIN LATERAL pc_blog_referenced_files(p.cover_image, p.sections) refs(id)
  JOIN directus_files f ON f.id = refs.id;
UPDATE directus_files SET pc_blog_managed = true
  WHERE id IN (SELECT file_id FROM pc_blog_file_links);
UPDATE directus_files f SET pc_blog_public_at = (
  SELECT MIN(p.published_at) FROM pc_blog_file_links l JOIN pc_blog_posts p ON p.id = l.post_id
  WHERE l.file_id = f.id AND p.published = true
) WHERE f.pc_blog_managed = true;
COMMIT;
