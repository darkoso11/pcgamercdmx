import fs from 'node:fs';
import path from 'node:path';

const baseUrl = (process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com').replace(/\/+$/, '');
const token = process.env.DIRECTUS_TOKEN || await login();
const write = process.argv.includes('--write');

const [posts, legacyCategories, legacySubcategories, blogCategories, blogSubcategories] = await Promise.all([
  getItems('pc_blog_posts'),
  getItems('pc_categories', true),
  getItems('pc_subcategories', true),
  getItems('pc_blog_categories'),
  getItems('pc_blog_subcategories'),
]);

const summary = {
  mode: write ? 'write' : 'dry-run',
  postsReviewed: posts.length,
  categoriesCreated: 0,
  subcategoriesCreated: 0,
  postsUpdated: 0,
  unresolved: [],
};

const categoryBySlug = new Map(blogCategories.map((item) => [item.slug, item]));
const subcategoryByKey = new Map(
  blogSubcategories.map((item) => [`${item.category_id}:${item.slug}`, item])
);

for (const post of posts) {
  const categoryName = resolveName(post.category, legacyCategories);
  if (!categoryName) {
    summary.unresolved.push({ post: post.id, field: 'category', value: post.category });
    continue;
  }

  const category = await ensureCategory(categoryName);
  let subcategory = null;
  if (post.subcategory) {
    const subcategoryName = resolveName(post.subcategory, legacySubcategories);
    if (subcategoryName) {
      subcategory = await ensureSubcategory(subcategoryName, String(category.id));
    } else {
      summary.unresolved.push({ post: post.id, field: 'subcategory', value: post.subcategory });
    }
  }

  const nextCategory = String(category.id);
  const nextSubcategory = subcategory ? String(subcategory.id) : null;
  if (String(post.category ?? '') === nextCategory && String(post.subcategory ?? '') === String(nextSubcategory ?? '')) {
    continue;
  }

  summary.postsUpdated += 1;
  if (write) {
    await request(`/items/pc_blog_posts/${post.id}`, {
      method: 'PATCH',
      body: { category: nextCategory, subcategory: nextSubcategory },
    });
  }
}

console.log(JSON.stringify(summary, null, 2));

async function ensureCategory(name) {
  const slug = slugify(name);
  if (categoryBySlug.has(slug)) {
    return categoryBySlug.get(slug);
  }
  const candidate = { id: `dry:${slug}`, name, slug, description: '', sort: categoryBySlug.size + 1, published: true };
  const created = write
    ? (await request('/items/pc_blog_categories', { method: 'POST', body: candidateWithoutDryId(candidate) })).data
    : candidate;
  categoryBySlug.set(slug, created);
  summary.categoriesCreated += 1;
  return created;
}

async function ensureSubcategory(name, categoryId) {
  const slug = slugify(name);
  const key = `${categoryId}:${slug}`;
  if (subcategoryByKey.has(key)) {
    return subcategoryByKey.get(key);
  }
  const candidate = {
    id: `dry:${slug}`,
    name,
    slug,
    category_id: categoryId,
    description: '',
    sort: subcategoryByKey.size + 1,
    published: true,
  };
  const created = write
    ? (await request('/items/pc_blog_subcategories', { method: 'POST', body: candidateWithoutDryId(candidate) })).data
    : candidate;
  subcategoryByKey.set(key, created);
  summary.subcategoriesCreated += 1;
  return created;
}

function resolveName(value, legacyItems) {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  const matched = legacyItems.find((item) =>
    String(item.id) === String(value) || item.slug === value
  );
  return String(matched?.name || value).trim();
}

function slugify(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function candidateWithoutDryId(candidate) {
  const { id, ...payload } = candidate;
  return payload;
}

async function getItems(collection, optional = false) {
  const response = await request(`/items/${collection}?fields=*&limit=1000`, { allow404: optional });
  return response?.data || [];
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
  if (options.allow404 && response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${await response.text()}`);
  }
  return response.status === 204 ? null : response.json();
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
