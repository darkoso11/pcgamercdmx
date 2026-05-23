import fs from 'node:fs';
import path from 'node:path';
import Module from 'node:module';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { firstValueFrom } = require('rxjs');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

registerTypeScriptRuntime();

const { ProductsService } = require(path.join(root, 'src/app/features/products/services/products.service.ts'));
const {
  mapCatalogProductToDirectusPayload,
  mapArticleToDirectusPayload,
} = require(path.join(root, 'src/app/core/services/directus-content.mapper.ts'));
const { ProductCategory } = require(path.join(root, 'src/app/shared/models/product.model.ts'));

const credentials = loadCredentials();
const token = await login(credentials);

await ensureSubcategoriesCollection();

const categoriesBySlug = await upsertCategories();
const subcategoriesBySlug = await upsertSubcategories(categoriesBySlug);
const products = await loadAngularCatalog();
const productStats = await upsertProducts(products, categoriesBySlug, subcategoriesBySlug);
const blogStats = await upsertBlogSample(categoriesBySlug);

console.log(JSON.stringify({
  categories: categoriesBySlug.size,
  subcategories: subcategoriesBySlug.size,
  products: productStats,
  blogPosts: blogStats,
}, null, 2));

function registerTypeScriptRuntime() {
  const originalLoad = Module._load;
  Module._load = function load(request, parent, isMain) {
    if (request === '@angular/core') {
      return {
        Injectable: () => (target) => target,
      };
    }

    if (request === '@angular/common/http') {
      class HttpHeaders {
        constructor(value) {
          this.value = value;
        }
      }
      class HttpParams {
        constructor() {
          this.values = new Map();
        }
        set(key, value) {
          const next = new HttpParams();
          next.values = new Map(this.values);
          next.values.set(key, value);
          return next;
        }
      }
      return { HttpClient: class {}, HttpHeaders, HttpParams };
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  require.extensions['.ts'] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const output = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
      fileName: filename,
    }).outputText;
    module._compile(output, filename);
  };
}

function loadCredentials() {
  const directusUrl = process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com';
  const email = process.env.DIRECTUS_EMAIL;
  const password = process.env.DIRECTUS_PASSWORD;

  if (email && password) {
    return { url: directusUrl.replace(/\/+$/, ''), email, password };
  }

  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  const credentialsPath = path.join(userProfile, '.pcgamercdmx', 'directus-backend.txt');
  const raw = fs.readFileSync(credentialsPath, 'utf8');
  const fileEmail = matchLine(raw, 'Admin email');
  const filePassword = matchLine(raw, 'Admin password');
  const fileUrl = matchLine(raw, 'URL') || directusUrl;

  if (!fileEmail || !filePassword) {
    throw new Error('No Directus credentials found in env or local credentials file.');
  }

  return {
    url: fileUrl.replace(/\/+$/, ''),
    email: fileEmail,
    password: filePassword,
  };
}

function matchLine(raw, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = raw.match(new RegExp(`^\\s*${escaped}\\s*[:=]\\s*(.+?)\\s*$`, 'im'));
  return match?.[1]?.trim();
}

async function login({ url, email, password }) {
  const response = await fetch(`${url}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, mode: 'json' }),
  });

  if (!response.ok) {
    throw new Error(`Directus login failed: ${response.status}`);
  }

  const json = await response.json();
  return json.data.access_token;
}

async function directus(pathname, options = {}) {
  const response = await fetch(`${credentials.url}${pathname}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${options.method || 'GET'} ${pathname} failed: ${response.status} ${body.slice(0, 500)}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function ensureSubcategoriesCollection() {
  if (await collectionExists('pc_subcategories')) {
    return;
  }

  await directus('/collections', {
    method: 'POST',
    body: JSON.stringify({
      collection: 'pc_subcategories',
      meta: {
        icon: 'account_tree',
        note: 'Catalog and blog subcategories',
        display_template: '{{name}}',
        sort: 21,
      },
      schema: {},
    }),
  });

  await ensureField('pc_subcategories', {
    field: 'name',
    type: 'string',
    schema: { is_nullable: false, max_length: 255 },
    meta: { interface: 'input', required: true, sort: 2, width: 'full' },
  });
  await ensureField('pc_subcategories', {
    field: 'slug',
    type: 'string',
    schema: { is_nullable: false, is_unique: true, max_length: 255 },
    meta: { interface: 'input', required: true, sort: 3, width: 'half' },
  });
  await ensureField('pc_subcategories', {
    field: 'description',
    type: 'text',
    schema: { is_nullable: true },
    meta: { interface: 'input-multiline', sort: 4, width: 'full' },
  });
  await ensureField('pc_subcategories', {
    field: 'icon',
    type: 'string',
    schema: { is_nullable: true, max_length: 255 },
    meta: { interface: 'input', sort: 5, width: 'half' },
  });
  await ensureField('pc_subcategories', {
    field: 'category_id',
    type: 'integer',
    schema: { is_nullable: true },
    meta: { interface: 'input', sort: 6, width: 'half' },
  });
  await ensureField('pc_subcategories', {
    field: 'category_slug',
    type: 'string',
    schema: { is_nullable: true, max_length: 255 },
    meta: { interface: 'input', sort: 7, width: 'half' },
  });
  await ensureField('pc_subcategories', {
    field: 'sort',
    type: 'integer',
    schema: { is_nullable: true },
    meta: { interface: 'input', sort: 8, width: 'half' },
  });
  await ensureField('pc_subcategories', {
    field: 'published',
    type: 'boolean',
    schema: { default_value: true, is_nullable: true },
    meta: { interface: 'boolean', sort: 9, width: 'half' },
  });
}

async function collectionExists(collection) {
  const response = await fetch(`${credentials.url}/collections/${collection}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.ok;
}

async function ensureField(collection, field) {
  const fields = await directus(`/fields/${collection}`);
  if (fields.data.some((item) => item.field === field.field)) {
    return;
  }

  await directus(`/fields/${collection}`, {
    method: 'POST',
    body: JSON.stringify(field),
  });
}

async function upsertCategories() {
  const categories = [
    {
      name: 'Ensambles',
      slug: 'ensambles',
      description: 'PCs armadas personalizadas',
      icon: 'computer',
      sort: 1,
      published: true,
    },
    {
      name: 'Componentes',
      slug: 'componentes',
      description: 'Componentes internos para PC',
      icon: 'memory',
      sort: 2,
      published: true,
    },
    {
      name: 'Perifericos',
      slug: 'perifericos',
      description: 'Accesorios y perifericos gaming',
      icon: 'keyboard',
      sort: 3,
      published: true,
    },
  ];

  const result = new Map();
  for (const category of categories) {
    const item = await upsertBySlug('pc_categories', category);
    result.set(category.slug, item);
  }
  return result;
}

async function upsertSubcategories(categoriesBySlug) {
  const subcategories = [
    ['ensambles', 'pc-gaming', 'PC Gaming', 'fa-gamepad'],
    ['ensambles', 'pc-streaming', 'PC Streaming', 'fa-stream'],
    ['ensambles', 'pc-editing', 'PC Edicion', 'fa-video'],
    ['ensambles', 'pc-workstation', 'Workstation', 'fa-cpu'],
    ['componentes', 'cpu', 'Procesadores', 'fa-microchip'],
    ['componentes', 'gpu', 'Tarjetas Graficas', 'fa-video'],
    ['componentes', 'ram', 'Memoria RAM', 'fa-memory'],
    ['componentes', 'storage', 'Almacenamiento', 'fa-hdd'],
    ['perifericos', 'keyboard', 'Teclados', 'fa-keyboard'],
    ['perifericos', 'mouse', 'Ratones', 'fa-mouse'],
    ['perifericos', 'monitor', 'Monitores', 'fa-tv'],
    ['perifericos', 'headset', 'Audifonos', 'fa-headphones'],
  ];

  const result = new Map();
  let sort = 1;
  for (const [categorySlug, slug, name, icon] of subcategories) {
    const category = categoriesBySlug.get(categorySlug);
    const directusSlug = `${categorySlug}-${slug}`;
    const item = await upsertBySlug('pc_subcategories', {
      name,
      slug: directusSlug,
      description: '',
      icon,
      category_id: category.id,
      category_slug: categorySlug,
      sort,
      published: true,
    });
    result.set(`${categorySlug}:${slug}`, item);
    sort += 1;
  }
  return result;
}

async function loadAngularCatalog() {
  const fakeDirectus = { isEnabled: () => false };
  const service = new ProductsService(fakeDirectus);
  return firstValueFrom(service.getCatalogProducts());
}

async function upsertProducts(products, categoriesBySlug, subcategoriesBySlug) {
  const stats = { created: 0, updated: 0 };

  for (const product of products) {
    const categorySlug = categorySlugForProduct(product.category);
    const category = categoriesBySlug.get(categorySlug);
    const subcategory = subcategoriesBySlug.get(`${categorySlug}:${product.subcategory}`);
    const payload = mapCatalogProductToDirectusPayload(product);
    payload.specifications.admin = {
      productType: productTypeForProduct(product.category),
      brand: guessBrand(product),
      categoryId: String(category?.id ?? ''),
      subcategoryId: String(subcategory?.id ?? ''),
      discountPrice: product.discountedPrice ?? null,
      discountPercent: null,
      currency: product.currency ?? 'MXN',
      sku: product.sku ?? '',
      gallery: payload.images,
      internalNotes: 'Migrated from Angular mock catalog',
      createdAt: normalizeDate(product.createdAt),
      updatedAt: normalizeDate(product.updatedAt),
    };

    const before = await findBySlug('pc_products', payload.slug);
    await upsertBySlug('pc_products', payload);
    if (before) {
      stats.updated += 1;
    } else {
      stats.created += 1;
    }
  }

  return stats;
}

async function upsertBlogSample(categoriesBySlug) {
  const blogPath = path.join(root, 'src/assets/mock/blog-sample.json');
  const articles = JSON.parse(fs.readFileSync(blogPath, 'utf8'));
  const stats = { created: 0, updated: 0 };
  const defaultCategory = categoriesBySlug.get('componentes');

  for (const article of articles) {
    const payload = mapArticleToDirectusPayload({
      ...article,
      categoryId: String(defaultCategory?.id ?? article.categoryId ?? ''),
    });
    payload.sort = Number(article._id) || 1;
    const before = await findBySlug('pc_blog_posts', payload.slug);
    await upsertBySlug('pc_blog_posts', payload);
    if (before) {
      stats.updated += 1;
    } else {
      stats.created += 1;
    }
  }

  return stats;
}

async function findBySlug(collection, slug) {
  const params = new URLSearchParams({
    'filter[slug][_eq]': slug,
    limit: '1',
  });
  const response = await directus(`/items/${collection}?${params.toString()}`);
  return response.data[0] ?? null;
}

async function upsertBySlug(collection, payload) {
  const existing = await findBySlug(collection, payload.slug);
  if (existing) {
    const response = await directus(`/items/${collection}/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return response.data;
  }

  const response = await directus(`/items/${collection}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data;
}

function categorySlugForProduct(category) {
  switch (category) {
    case ProductCategory.ASSEMBLED:
      return 'ensambles';
    case ProductCategory.PERIPHERAL:
      return 'perifericos';
    case ProductCategory.COMPONENT:
    default:
      return 'componentes';
  }
}

function productTypeForProduct(category) {
  switch (category) {
    case ProductCategory.ASSEMBLED:
      return 'gabinete';
    case ProductCategory.PERIPHERAL:
      return 'periferico';
    case ProductCategory.COMPONENT:
    default:
      return 'componente';
  }
}

function guessBrand(product) {
  if (product.category === ProductCategory.ASSEMBLED) {
    return product.performance?.cpuBrand ?? '';
  }

  return product.specifications?.brand ?? '';
}

function normalizeDate(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
