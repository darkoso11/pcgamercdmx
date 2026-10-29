export interface SitemapPost {
  slug?: string;
  published?: boolean;
  published_at?: string;
  date_updated?: string;
}

export function buildBlogSitemap(staticXml: string, posts: SitemapPost[], siteUrl: string, now = Date.now()): string {
  if (!staticXml.includes('</urlset>')) throw new Error('Invalid base sitemap');
  const base = staticXml.replace(/<url>\s*<loc>[^<]*\/blog\/[^<]*<\/loc>[\s\S]*?<\/url>/g, '');
  const entries = new Map<string, string>();
  for (const post of posts) {
    if (!post.slug || post.published !== true || !post.published_at || !Number.isFinite(Date.parse(post.published_at)) || Date.parse(post.published_at) > now) continue;
    const url = new URL(`/blog/${encodeURIComponent(post.slug)}`, siteUrl).toString();
    const updated = post.date_updated && Number.isFinite(Date.parse(post.date_updated)) && Date.parse(post.date_updated) <= now
      ? post.date_updated : post.published_at;
    entries.set(url, `<url><loc>${escapeXml(url)}</loc><lastmod>${new Date(updated).toISOString()}</lastmod></url>`);
  }
  return base.replace('</urlset>', `${[...entries.values()].join('\n')}\n</urlset>`);
}

function escapeXml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
