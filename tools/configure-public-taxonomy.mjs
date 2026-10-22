import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Dry run by default. Never print credentials or session tokens.
const write = process.argv.includes('--write');
const raw = process.env.DIRECTUS_EMAIL && process.env.DIRECTUS_PASSWORD ? '' :
  fs.readFileSync(path.join(os.homedir(), '.pcgamercdmx', 'directus-backend.txt'), 'utf8');
const line = key => raw.match(new RegExp(`^\\s*${key}\\s*[:=]\\s*(.+?)\\s*$`, 'im'))?.[1]?.trim();
const url = (process.env.DIRECTUS_URL || line('URL') || 'https://cms.test.pcgamercdmx.com').replace(/\/+$/, '');
const login = await fetch(`${url}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: process.env.DIRECTUS_EMAIL || line('Admin email'),
    password: process.env.DIRECTUS_PASSWORD || line('Admin password'), mode: 'json' }),
});
if (!login.ok) throw new Error(`Directus login failed (${login.status}).`);
const token = (await login.json()).data.access_token;
async function request(endpoint, options = {}) {
  const response = await fetch(`${url}${endpoint}`, { ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Directus ${options.method || 'GET'} ${endpoint} failed (${response.status}).`);
  return response.json();
}
const access = await request('/access?filter[role][_null]=true&filter[user][_null]=true&fields=policy');
if (access.data.length !== 1) throw new Error('Expected one public policy; inspect access before changing permissions.');
const policy = access.data[0].policy;
const existing = await request(`/permissions?filter[policy][_eq]=${policy}&filter[collection][_eq]=pc_subcategories&fields=id,action,permissions,fields`);
const fields = ['id', 'name', 'slug', 'category_id', 'category_slug', 'sort', 'published'];
const payload = { policy, collection: 'pc_subcategories', action: 'read',
  permissions: { published: { _eq: true } }, fields,
};
if (existing.data.length) {
  const read = existing.data.find(item => item.action === 'read');
  if (existing.data.length !== 1 || !read || JSON.stringify(read.permissions) !== JSON.stringify(payload.permissions) || read.fields.length !== fields.length || !fields.every(field => read.fields.includes(field))) {
    throw new Error('Existing permissions differ from the expected read-only policy; left unchanged.');
  }
  process.stdout.write(`${JSON.stringify({ url, status: 'already-configured', permissionId: read.id })}\n`);
} else {
  process.stdout.write(`${JSON.stringify({ url, mode: write ? 'write' : 'dry-run', permission: payload })}\n`);
  if (write) {
    const created = await request('/permissions', { method: 'POST', body: JSON.stringify(payload) });
    process.stdout.write(`${JSON.stringify({ status: 'created', permissionId: created.data.id })}\n`);
  }
}
if (write || existing.data.length) {
  const response = await fetch(`${url}/items/pc_subcategories?fields=${fields.join(',')}&limit=-1`);
  if (!response.ok) throw new Error(`Public taxonomy verification failed (${response.status}).`);
  const { data } = await response.json();
  if (data.some(item => item.published !== true || Object.keys(item).some(key => !fields.includes(key)))) {
    throw new Error('Public response contains unexpected fields or unpublished records.');
  }
  process.stdout.write(`${JSON.stringify({ publicReadStatus: response.status, publishedSubcategories: data.length })}\n`);
}
