import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const base = (process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com').replace(/\/$/, '');
const raw = fs.readFileSync(path.join(os.homedir(), '.pcgamercdmx/directus-backend.txt'), 'utf8');
const value = label => raw.match(new RegExp(`^${label}:\\s*(.+)$`, 'm'))?.[1].trim();
const login = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: value('Admin email'), password: value('Admin password') }) });
if (!login.ok) throw new Error(`CMS login: ${login.status}`);
const token = (await login.json()).data.access_token;
async function request(route, method = 'GET', body) {
  const response = await fetch(base + route, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${route}: ${response.status}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
const fields = (await request('/fields/pc_blog_posts')).data;
const posts = (await request('/items/pc_blog_posts?fields=id,slug&limit=-1')).data;
const seen = new Set();
for (const post of posts) {
  if (post.slug && seen.has(post.slug)) throw new Error('Duplicate blog slugs exist; resolve them before enabling uniqueness');
  if (post.slug) seen.add(post.slug);
}
if (!fields.find(item => item.field === 'slug')?.schema?.is_unique) {
  await request('/fields/pc_blog_posts/slug', 'PATCH', { schema: { is_unique: true } });
}
for (const [field, type, special] of [
  ['seo_title', 'string', null], ['seo_description', 'text', null], ['seo_image', 'text', null],
  ['date_created', 'timestamp', 'date-created'], ['date_updated', 'timestamp', 'date-updated'],
]) {
  if (!fields.some(item => item.field === field)) {
    await request('/fields/pc_blog_posts', 'POST', { field, type, schema: { is_nullable: true }, meta: { hidden: Boolean(special), readonly: Boolean(special), ...(special ? { special: [special] } : {}) } });
  }
}
await request('/utils/cache/clear', 'POST');
console.log('Blog SEO fields ready; existing content and public permissions preserved.');
