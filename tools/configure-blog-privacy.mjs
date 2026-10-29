import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const base = (process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com').replace(/\/$/, '');
const raw = fs.readFileSync(path.join(os.homedir(), '.pcgamercdmx/directus-backend.txt'), 'utf8');
const credential = label => raw.match(new RegExp(`^${label}:\\s*(.+)$`, 'm'))?.[1].trim();
const login = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: credential('Admin email'), password: credential('Admin password') }) });
if (!login.ok) throw new Error(`CMS login: ${login.status}`);
const token = (await login.json()).data.access_token;
async function request(route, method = 'GET', body) {
  const response = await fetch(base + route, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  if (!response.ok) throw new Error(`${method} ${route}: ${response.status} ${await response.text()}`);
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
const publicAccess = (await request('/access?limit=-1&fields=role,user,policy')).data.filter(row => !row.role && !row.user);
const policyIds = new Set(publicAccess.map(row => typeof row.policy === 'object' ? row.policy.id : row.policy));
const permissions = (await request('/permissions?limit=-1')).data.filter(row => policyIds.has(row.policy) && ['pc_blog_posts', 'directus_files'].includes(row.collection));
if (!['pc_blog_posts', 'directus_files'].every(collection => permissions.some(row => row.collection === collection && row.action === 'read'))) {
  throw new Error('Expected public read policies were not found');
}
if (permissions.some(row => row.action !== 'read')) throw new Error('Unexpected public write permission; inspect before applying');
const backupDir = path.join(os.homedir(), '.pcgamercdmx/backups');
fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, `blog-privacy-${Date.now()}.json`), JSON.stringify(permissions, null, 2));
async function field(collection, definition) {
  const fields = (await request(`/fields/${collection}`)).data;
  if (!fields.some(item => item.field === definition.field)) await request(`/fields/${collection}`, 'POST', definition);
}
await field('directus_files', { field: 'pc_blog_managed', type: 'boolean', schema: { default_value: false, is_nullable: false }, meta: { hidden: true, interface: 'boolean', note: 'Managed by blog file reference synchronization' } });
await field('directus_files', { field: 'pc_blog_public_at', type: 'timestamp', schema: { is_nullable: true }, meta: { hidden: true, readonly: true, note: 'Earliest publication date among published blog references; maintained by SQL trigger' } });
const collections = (await request('/collections')).data;
if (!collections.some(item => item.collection === 'pc_blog_file_links')) {
  await request('/collections', 'POST', { collection: 'pc_blog_file_links', schema: {}, meta: { hidden: true }, fields: [
    { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true } },
    { field: 'post_id', type: 'integer', schema: { is_nullable: false } },
    { field: 'file_id', type: 'uuid', schema: { is_nullable: false } },
  ] });
}
await field('directus_files', { field: 'pc_blog_links', type: 'alias', meta: { special: ['o2m'], hidden: true } });
const relations = (await request('/relations')).data;
for (const [fieldName, related, alias] of [['file_id', 'directus_files', 'pc_blog_links'], ['post_id', 'pc_blog_posts', null]]) {
  if (!relations.some(row => row.collection === 'pc_blog_file_links' && row.field === fieldName)) {
    await request('/relations', 'POST', { collection: 'pc_blog_file_links', field: fieldName, related_collection: related, schema: { on_delete: 'CASCADE' }, meta: { one_field: alias } });
  }
}
if (!process.argv.includes('--schema-only')) {
  const published = { _and: [{ published: { _eq: true } }, { published_at: { _lte: '$NOW' } }] };
  for (const policy of policyIds) {
    const existing = (await request('/permissions?filter[collection][_eq]=pc_blog_file_links&limit=-1')).data.find(row => row.policy === policy && row.action === 'read');
    if (existing) await request(`/permissions/${existing.id}`, 'DELETE');
  }
  for (const permission of permissions) {
    if (permission.action !== 'read') throw new Error('Unexpected public write permission; inspect before applying');
    await request(`/permissions/${permission.id}`, 'PATCH', { permissions: permission.collection === 'pc_blog_posts' ? published : {
      _or: [{ pc_blog_managed: { _eq: false } }, { pc_blog_public_at: { _lte: '$NOW' } }],
    } });
  }
  await request('/utils/cache/clear', 'POST');
}
console.log(JSON.stringify({ ok: true, stage: process.argv.includes('--schema-only') ? 'schema' : 'permissions', publicPermissions: permissions.length }));
