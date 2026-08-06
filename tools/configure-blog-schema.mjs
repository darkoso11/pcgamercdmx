import fs from 'node:fs';
import path from 'node:path';

const baseUrl = (process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com').replace(/\/+$/, '');
const token = process.env.DIRECTUS_TOKEN || await login();

const collections = [
  {
    collection: 'pc_blog_categories',
    meta: { icon: 'folder_open', note: 'Taxonomía exclusiva del blog', sort_field: 'sort' },
    schema: {},
    fields: [
      ['name', 'string', { required: true }],
      ['slug', 'string', { required: true, unique: true }],
      ['description', 'text', {}],
      ['sort', 'integer', { default_value: 1 }],
      ['published', 'boolean', { default_value: true }],
    ],
  },
  {
    collection: 'pc_blog_subcategories',
    meta: { icon: 'folder', note: 'Subcategorías exclusivas del blog', sort_field: 'sort' },
    schema: {},
    fields: [
      ['name', 'string', { required: true }],
      ['slug', 'string', { required: true }],
      ['description', 'text', {}],
      ['category_id', 'string', { required: true }],
      ['sort', 'integer', { default_value: 1 }],
      ['published', 'boolean', { default_value: true }],
    ],
  },
];

for (const definition of collections) {
  const exists = await request(`/collections/${definition.collection}`, {
    allowMissing: true,
  });
  if (!exists) {
    await request('/collections', {
      method: 'POST',
      body: {
        collection: definition.collection,
        meta: definition.meta,
        schema: definition.schema,
      },
    });
    process.stdout.write(`created collection ${definition.collection}\n`);
  } else {
    await request(`/collections/${definition.collection}`, {
      method: 'PATCH',
      body: { meta: definition.meta },
    });
    process.stdout.write(`updated collection ${definition.collection}\n`);
  }

  for (const [field, type, meta] of definition.fields) {
    const current = await request(`/fields/${definition.collection}/${field}`, {
      allowMissing: true,
    });
    const payload = { field, type, meta };
    if (current) {
      await request(`/fields/${definition.collection}/${field}`, {
        method: 'PATCH',
        body: payload,
      });
    } else {
      await request(`/fields/${definition.collection}`, {
        method: 'POST',
        body: payload,
      });
    }
  }
}

await ensurePublicReadPermissions();

process.stdout.write(`${JSON.stringify({
  ok: true,
  collections: collections.map((item) => item.collection),
  publicRead: 'published=true',
}, null, 2)}\n`);

async function ensurePublicReadPermissions() {
  const policies = await request('/policies?fields=id,name,admin_access,app_access&limit=100');
  const publicPolicy = policies.data.find((policy) =>
    policy.name === '$t:public_label' ||
    (policy.admin_access === false && policy.app_access === false)
  );

  if (!publicPolicy) {
    throw new Error('No se encontró la política pública de Directus');
  }

  for (const definition of collections) {
    const existing = await request(
      `/permissions?filter[policy][_eq]=${encodeURIComponent(publicPolicy.id)}` +
      `&filter[collection][_eq]=${encodeURIComponent(definition.collection)}` +
      '&filter[action][_eq]=read&fields=id&limit=1'
    );
    const payload = {
      policy: publicPolicy.id,
      collection: definition.collection,
      action: 'read',
      permissions: { published: { _eq: true } },
      validation: {},
      presets: null,
      fields: ['*'],
    };

    if (existing.data[0]) {
      await request(`/permissions/${existing.data[0].id}`, {
        method: 'PATCH',
        body: payload,
      });
    } else {
      await request('/permissions', {
        method: 'POST',
        body: payload,
      });
    }
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (
    (options.allow404 && response.status === 404) ||
    (options.allowMissing && (response.status === 403 || response.status === 404))
  ) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${await response.text()}`);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

async function login() {
  const credentials = loadCredentials();
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password }),
  });
  if (!response.ok) {
    throw new Error(`No fue posible autenticar con Directus: ${response.status}`);
  }
  return (await response.json()).data.access_token;
}

function loadCredentials() {
  if (process.env.DIRECTUS_EMAIL && process.env.DIRECTUS_PASSWORD) {
    return { email: process.env.DIRECTUS_EMAIL, password: process.env.DIRECTUS_PASSWORD };
  }
  const credentialsPath = path.join(
    process.env.USERPROFILE || process.env.HOME || '',
    '.pcgamercdmx',
    'directus-backend.txt'
  );
  const raw = fs.readFileSync(credentialsPath, 'utf8');
  return {
    email: matchLine(raw, 'Admin email'),
    password: matchLine(raw, 'Admin password'),
  };
}

function matchLine(raw, label) {
  const value = raw.match(new RegExp(`^${label}:\\s*(.+)$`, 'mi'))?.[1]?.trim();
  if (!value) throw new Error(`Falta ${label} en las credenciales locales`);
  return value;
}
