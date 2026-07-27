import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  adminCommerceCollections,
  defaultPowerCertifications,
} from './admin-commerce-schema.mjs';

const credentials = loadCredentials();
const accessToken = await login(credentials);

for (const definition of adminCommerceCollections) {
  await ensureCollection(definition);
  for (const field of definition.fields) {
    await ensureField(definition.collection, field);
  }
}

await ensureDefaultPowerCertifications();
await ensurePublicOfferReadPermission();

console.log(
  `Esquema administrativo listo: ${adminCommerceCollections
    .map((definition) => definition.collection)
    .join(', ')}`
);

function loadCredentials() {
  const defaultUrl =
    process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com';
  const environmentEmail = process.env.DIRECTUS_EMAIL;
  const environmentPassword = process.env.DIRECTUS_PASSWORD;

  if (environmentEmail && environmentPassword) {
    return {
      url: defaultUrl.replace(/\/+$/, ''),
      email: environmentEmail,
      password: environmentPassword,
    };
  }

  const credentialsPath = path.join(
    os.homedir(),
    '.pcgamercdmx',
    'directus-backend.txt'
  );
  const raw = fs.readFileSync(credentialsPath, 'utf8');
  const email = matchLine(raw, 'Admin email');
  const password = matchLine(raw, 'Admin password');
  const url = matchLine(raw, 'URL') || defaultUrl;

  if (!email || !password) {
    throw new Error(
      'No se encontraron credenciales de Directus en el entorno o archivo local.'
    );
  }

  return { url: url.replace(/\/+$/, ''), email, password };
}

function matchLine(raw, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return raw.match(new RegExp(`^\\s*${escaped}\\s*[:=]\\s*(.+?)\\s*$`, 'im'))?.[1]?.trim();
}

async function login({ url, email, password }) {
  const response = await fetch(`${url}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, mode: 'json' }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo iniciar sesión en Directus (${response.status}).`);
  }

  const body = await response.json();
  return body.data.access_token;
}

async function request(pathname, options = {}) {
  const response = await fetch(`${credentials.url}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${options.method || 'GET'} ${pathname} falló (${response.status}): ${body.slice(0, 400)}`
    );
  }

  return response.status === 204 ? null : response.json();
}

async function ensureCollection(definition) {
  const response = await fetch(
    `${credentials.url}/collections/${definition.collection}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (response.ok) return;

  await request('/collections', {
    method: 'POST',
    body: JSON.stringify({
      collection: definition.collection,
      meta: definition.meta,
      schema: {},
    }),
  });
}

async function ensureField(collection, definition) {
  const fields = await request(`/fields/${collection}`);
  if (fields.data.some((item) => item.field === definition.field)) return;

  await request(`/fields/${collection}`, {
    method: 'POST',
    body: JSON.stringify(definition),
  });
}

async function ensureDefaultPowerCertifications() {
  const response = await request(
    '/items/pc_power_certifications?fields=id,name&limit=200'
  );
  const existingNames = new Set(
    response.data.map((item) => String(item.name).trim().toLowerCase())
  );

  for (const certification of defaultPowerCertifications) {
    if (existingNames.has(certification.name.toLowerCase())) continue;

    const absoluteFilePath = path.resolve(certification.filePath);
    const fileBuffer = fs.readFileSync(absoluteFilePath);
    const formData = new FormData();
    formData.append('title', certification.name);
    formData.append(
      'file',
      new Blob([fileBuffer], { type: 'image/png' }),
      path.basename(absoluteFilePath)
    );

    const uploadResponse = await fetch(`${credentials.url}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });
    if (!uploadResponse.ok) {
      throw new Error(
        `No se pudo cargar la imagen de ${certification.name} (${uploadResponse.status}).`
      );
    }
    const uploadBody = await uploadResponse.json();

    await request('/items/pc_power_certifications', {
      method: 'POST',
      body: JSON.stringify({
        name: certification.name,
        image: uploadBody.data.id,
        active: true,
        sort: certification.sort,
      }),
    });
  }
}

async function ensurePublicOfferReadPermission() {
  const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
  const offerDefinition = adminCommerceCollections.find(
    (definition) => definition.collection === 'pc_offers'
  );
  const query = new URLSearchParams({
    'filter[policy][_eq]': publicPolicyId,
    'filter[collection][_eq]': 'pc_offers',
    'filter[action][_eq]': 'read',
    fields: 'id',
    limit: '1',
  });
  const existing = await request(`/permissions?${query.toString()}`);
  if (existing.data.length) return;

  await request('/permissions', {
    method: 'POST',
    body: JSON.stringify({
      policy: publicPolicyId,
      collection: 'pc_offers',
      action: 'read',
      permissions: { active: { _eq: true } },
      validation: null,
      presets: null,
      fields: offerDefinition.publicReadFields,
    }),
  });
}
