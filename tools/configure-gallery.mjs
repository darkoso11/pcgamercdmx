import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Additive setup; dry-run by default. The legacy source is read from Git only during migration.
const write = process.argv.includes('--write');
const migrate = process.argv.includes('--import-legacy');
const raw = process.env.DIRECTUS_EMAIL && process.env.DIRECTUS_PASSWORD ? '' :
  fs.readFileSync(path.join(os.homedir(), '.pcgamercdmx', 'directus-backend.txt'), 'utf8');
const line = key => raw.match(new RegExp(`^\\s*${key}\\s*[:=]\\s*(.+?)\\s*$`, 'im'))?.[1]?.trim();
const url = (process.env.DIRECTUS_URL || line('URL') || 'https://cms.test.pcgamercdmx.com').replace(/\/+$/, '');
const login = await fetch(`${url}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.env.DIRECTUS_EMAIL || line('Admin email'), password: process.env.DIRECTUS_PASSWORD || line('Admin password'), mode: 'json' }) });
if (!login.ok) throw new Error(`Login failed (${login.status})`);
const token = (await login.json()).data.access_token;
async function request(endpoint, method = 'GET', body) {
  const form = body instanceof FormData;
  const response = await fetch(`${url}${endpoint}`, { method,
    headers: { Authorization: `Bearer ${token}`, ...(!form ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: form ? body : JSON.stringify(body) } : {}) });
  if (!response.ok) throw new Error(`${method} ${endpoint}: ${response.status} ${(await response.text()).slice(0, 350)}`);
  return response.status === 204 ? null : response.json();
}
const id = { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } };
const str = (field, length = 255) => ({ field, type: 'string', schema: { is_nullable: true, max_length: length }, meta: { interface: 'input' } });
const text = field => ({ field, type: 'text', meta: { interface: 'input-multiline' } });
const bool = field => ({ field, type: 'boolean', schema: { default_value: false }, meta: { interface: 'boolean', special: ['cast-boolean'] } });
const definitions = {
  pc_gallery_images: [id, str('src', 2048), str('title'), str('alt', 500), text('description'), str('category', 100),
    { field: 'tags', type: 'json', meta: { interface: 'tags', special: ['cast-json'] } }, str('author'),
    { field: 'date', type: 'date' }, bool('published'), { field: 'sort_order', type: 'integer', schema: { default_value: 0 } },
    { ...str('legacy_key', 2048), schema: { is_nullable: true, is_unique: true, max_length: 2048 } }],
  pc_gallery_settings: [id, str('heading'), text('subtitle'), str('seo_title'), text('seo_description'),
    { field: 'social_image_id', type: 'integer', schema: { is_nullable: true } }, bool('legacy_imported')],
};
const existing = (await request('/collections')).data;
const access = (await request('/access?filter[role][_null]=true&filter[user][_null]=true&fields=policy')).data;
if (access.length !== 1) throw new Error('Expected one public policy');
const policy = access[0].policy;
const permissions = (await request(`/permissions?filter[policy][_eq]=${policy}&limit=-1`)).data;
process.stdout.write(JSON.stringify({ url, mode: write ? 'write' : 'dry-run', collections: Object.keys(definitions) }, null, 2) + '\n');
for (const [collection, fields] of Object.entries(definitions)) {
  const exists = existing.some(c => c.collection === collection);
  const currentFields = exists ? (await request(`/fields/${collection}`)).data : [];
  const missing = fields.filter(f => !currentFields.some(c => c.field === f.field));
  process.stdout.write(`${collection}: ${exists ? 'exists' : 'new'}, missing fields: ${missing.map(f => f.field).join(',')}\n`);
  if (write) {
    if (!exists) await request('/collections', 'POST', { collection, schema: {}, meta: { icon: 'photo_library' }, fields });
    else for (const field of missing) await request(`/fields/${collection}`, 'POST', field);
    const reads = permissions.filter(p => p.collection === collection);
    if (reads.some(p => p.action !== 'read')) throw new Error('Unexpected public write access');
    const payload = { policy, collection, action: 'read',
      permissions: collection === 'pc_gallery_images' ? { published: { _eq: true } } : { id: { _eq: 1 } },
      fields: fields.map(f => f.field).filter(f => !['legacy_key', 'legacy_imported'].includes(f)) };
    if (reads.length > 1) throw new Error('Multiple public read permissions');
    if (reads.length) await request(`/permissions/${reads[0].id}`, 'PATCH', payload);
    else await request('/permissions', 'POST', payload);
  }
}
let settings = existing.some(c => c.collection === 'pc_gallery_settings') || write
  ? (await request('/items/pc_gallery_settings?filter[id][_eq]=1')).data[0] : null;
if (!settings && write) settings = (await request('/items/pc_gallery_settings', 'POST', {
  id: 1, heading: 'GALERÍA CYBER', subtitle: 'Explora nuestras creaciones y productos en un universo digital',
  seo_title: 'Galería | PC Gamer CDMX', seo_description: 'Galería de ensambles, gabinetes personalizados y setups creados por PC Gamer CDMX.',
  social_image_id: null, legacy_imported: false,
})).data;
if (migrate && !settings?.legacy_imported) {
  const source = execFileSync('git', ['show', '1160d8f:src/app/features/gallery/gallery.service.ts'], { encoding: 'utf8' });
  const legacy = source.split('\n').filter(l => l.trim().startsWith('{ "src":')).map(l => JSON.parse(l.trim().replace(/,$/, '')));
  if (legacy.length !== 8) throw new Error('Unexpected legacy image count');
  const records = existing.some(c => c.collection === 'pc_gallery_images') || write
    ? (await request('/items/pc_gallery_images?fields=id,legacy_key&limit=-1')).data : [];
  process.stdout.write(`Legacy migration: ${legacy.length} total, ${records.length} existing records\n`);
  for (const [index, item] of legacy.entries()) {
    if (records.some(r => r.legacy_key === item.src)) continue;
    const local = path.resolve('src', item.src.replace(/^\//, ''));
    if (!local.startsWith(path.resolve('src/assets') + path.sep)) throw new Error('Legacy path outside assets');
    const content = fs.readFileSync(local);
    if (write) {
      const form = new FormData();
      const mime = local.endsWith('.webp') ? 'image/webp' : 'image/png';
      form.append('title', item.title);
      form.append('file', new Blob([content], { type: mime }), path.basename(local));
      const file = (await request('/files', 'POST', form)).data;
      await request('/items/pc_gallery_images', 'POST', { ...item, src: `${url}/assets/${file.id}`,
        alt: item.title, description: '', published: true, sort_order: index, legacy_key: item.src });
    }
  }
  if (write) await request('/items/pc_gallery_settings/1', 'PATCH', { legacy_imported: true });
} else if (migrate) process.stdout.write('Legacy migration already completed; deleted images will not be recreated.\n');
if (write) {
  const publicResponse = await fetch(`${url}/items/pc_gallery_images?fields=id,src&limit=-1`);
  if (!publicResponse.ok) throw new Error(`Public read failed (${publicResponse.status})`);
  const images = (await publicResponse.json()).data;
  for (const image of images) {
    const asset = await fetch(image.src, { method: 'HEAD' });
    if (!asset.ok) throw new Error(`Public asset ${image.id} failed (${asset.status})`);
  }
  process.stdout.write(`Verified ${images.length} public image records and assets.\n`);
}
