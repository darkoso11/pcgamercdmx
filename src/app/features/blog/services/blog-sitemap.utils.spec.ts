import { buildBlogSitemap } from './blog-sitemap.utils';

describe('Blog sitemap', () => {
  it('includes only published entries whose date has arrived and removes stale blog URLs', () => {
    const xml = buildBlogSitemap('<urlset><url><loc>https://example.com/contacto</loc></url><url><loc>https://example.com/blog/removed</loc></url></urlset>', [
      { slug: 'visible', published: true, published_at: '2020-01-01' },
      { slug: 'draft', published: false, published_at: '2020-01-01' },
      { slug: 'future', published: true, published_at: '2099-01-01' },
      { slug: 'undated', published: true },
    ], 'https://example.com');
    expect(xml).toContain('/blog/visible');
    expect(xml).toContain('/contacto');
    for (const slug of ['removed', 'draft', 'future', 'undated']) expect(xml).not.toContain('/blog/' + slug);
  });
  it('deduplicates URLs, escapes the origin and uses the real modification date', () => {
    const post = { slug: 'example', published: true, published_at: '2020-01-01', date_updated: '2020-02-01' };
    const xml = buildBlogSitemap('<urlset></urlset>', [post, post], 'https://example.com');
    expect((xml.match(/<loc>/g) || []).length).toBe(1);
    expect(xml).toContain('2020-02-01T00:00:00.000Z');
  });
});
