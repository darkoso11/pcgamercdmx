import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { brandFields, planBrands, publicBrandFields } from './brand-catalog-schema.mjs';

// Read-only plan by default. --write applies only the additive brand registry.
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
if (!login.ok) throw new Error(`No se pudo iniciar sesión (${login.status}).`);
const token = (await login.json()).data.access_token;
async function request(endpoint, method = 'GET', body) {
  const response = await fetch(`${url}${endpoint}`, { method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!response.ok) throw new Error(`${method} ${endpoint} falló (${response.status}).`);
  return response.status === 204 ? null : response.json();
}
const collections = (await request('/collections')).data;
const exists = collections.some(item => item.collection === 'pc_brands');
const fields = exists ? (await request('/fields/pc_brands')).data : [];
const existing = exists ? (await request('/items/pc_brands?limit=-1')).data : [];
const products = (await request('/items/pc_products?fields=id,specifications,brand_logos&limit=-1')).data;
const brands = planBrands(products, existing);
const access = (await request('/access?filter[role][_null]=true&filter[user][_null]=true&fields=policy')).data;
if (access.length !== 1) throw new Error('No hay una única política pública. No se modificó el CMS.');
const policy = access[0].policy;
const permissions = (await request(`/permissions?filter[policy][_eq]=${policy}&filter[collection][_eq]=pc_brands`)).data;
if (permissions.some(item => item.action !== 'read')) throw new Error('La colección tiene permisos públicos de escritura inesperados.');
console.log(JSON.stringify({ url, mode: write ? 'write' : 'dry-run', createCollection: !exists,
  fieldsToCreate: brandFields.filter(field => !fields.some(item => item.field === field.field)).map(field => field.field),
  brandsToCreate: brands.length, createPublicRead: !permissions.length }, null, 2));
if (write) {
  if (!exists) await request('/collections', 'POST', { collection: 'pc_brands', schema: {},
    meta: { icon: 'sell', display_template: '{{name}}', note: 'Marcas compartidas de productos y ensambles' }, fields: brandFields });
  else for (const field of brandFields) {
    if (!fields.some(item => item.field === field.field)) await request('/fields/pc_brands', 'POST', field);
  }
  for (const brand of brands) await request('/items/pc_brands', 'POST', brand);
  if (!permissions.length) await request('/permissions', 'POST', {
    policy, collection: 'pc_brands', action: 'read', permissions: {}, fields: publicBrandFields,
  });
  const publicRead = await fetch(`${url}/items/pc_brands?fields=${publicBrandFields.join(',')}&limit=1`);
  if (!publicRead.ok) throw new Error(`Falló la comprobación pública (${publicRead.status}).`);
  console.log('Catálogo de marcas listo. Productos y categorías existentes conservados.');
}
