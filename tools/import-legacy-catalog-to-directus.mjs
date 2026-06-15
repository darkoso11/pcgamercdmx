import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const catalogDir = path.resolve(root, process.env.LEGACY_CATALOG_DIR || 'data/legacy-catalog');
const productsPath = path.join(catalogDir, 'products.normalized.json');
const fileCachePath = path.join(catalogDir, 'directus-files-map.json');
const summaryPath = path.join(catalogDir, 'directus-import-summary.json');

const credentials = await loadCredentials();
const token = await login(credentials);
const fileCache = await readJson(fileCachePath, {});

const broadCategories = await ensureBroadCategories();
const products = await readJson(productsPath, []);
const stats = {
  products: { created: 0, updated: 0, failed: 0 },
  categories: broadCategories.size,
  subcategories: { created: 0, updated: 0 },
  images: { uploaded: 0, reused: 0, failed: 0 },
  failures: [],
};

const subcategoriesByKey = await loadSubcategories();

for (const [index, product] of products.entries()) {
  try {
    const normalized = normalizeProduct(product);
    const subcategory = await ensureSubcategory(normalized, subcategoriesByKey);
    const imageUrls = await uploadProductImages(product);
    const payload = buildDirectusProductPayload(product, normalized, subcategory, imageUrls, index);
    const existing = await findBySlug('pc_products', payload.slug);

    if (existing) {
      await directus(`/items/pc_products/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      stats.products.updated += 1;
    } else {
      await directus('/items/pc_products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      stats.products.created += 1;
    }
  } catch (error) {
    stats.products.failed += 1;
    stats.failures.push({
      slug: product.slug,
      title: product.title,
      error: error.message,
    });
  }

  const done = index + 1;
  if (done % 25 === 0 || done === products.length) {
    console.log(`Imported ${done}/${products.length}`);
    await fs.writeFile(fileCachePath, `${JSON.stringify(fileCache, null, 2)}\n`, 'utf8');
  }
}

await fs.writeFile(fileCachePath, `${JSON.stringify(fileCache, null, 2)}\n`, 'utf8');
await fs.writeFile(summaryPath, `${JSON.stringify({
  directusUrl: credentials.url,
  importedAt: new Date().toISOString(),
  ...stats,
}, null, 2)}\n`, 'utf8');

console.log(JSON.stringify(stats, null, 2));

function loadCredentials() {
  const directusUrl = process.env.DIRECTUS_URL?.replace(/\/+$/, '');
  const email = process.env.DIRECTUS_EMAIL;
  const password = process.env.DIRECTUS_PASSWORD;

  if (directusUrl && email && password) {
    return { url: directusUrl, email, password };
  }

  const userProfile = process.env.USERPROFILE || process.env.HOME || '';
  const credentialsPath = path.join(userProfile, '.pcgamercdmx', 'directus-backend.txt');
  return fs.readFile(credentialsPath, 'utf8')
    .then((raw) => {
      const fileEmail = matchLine(raw, 'Admin email');
      const filePassword = matchLine(raw, 'Admin password');
      const fileUrl = matchLine(raw, 'URL') || directusUrl;

      if (!fileUrl || !fileEmail || !filePassword) {
        throw new Error('Missing Directus credentials.');
      }

      return {
        url: fileUrl.replace(/\/+$/, ''),
        email: fileEmail,
        password: filePassword,
      };
    })
    .catch(() => {
      throw new Error('Set DIRECTUS_URL, DIRECTUS_EMAIL and DIRECTUS_PASSWORD to import the catalog.');
    });
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
    throw new Error(`Directus login failed: ${response.status}`);
  }

  const json = await response.json();
  return json.data.access_token;
}

async function directus(pathname, options = {}) {
  const response = await fetch(`${credentials.url}${pathname}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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

async function ensureBroadCategories() {
  const categories = [
    { name: 'Ensambles', slug: 'ensambles', description: 'PCs armadas personalizadas', icon: 'computer', sort: 1 },
    { name: 'Componentes', slug: 'componentes', description: 'Componentes internos para PC', icon: 'memory', sort: 2 },
    { name: 'Perifericos', slug: 'perifericos', description: 'Accesorios y perifericos gaming', icon: 'keyboard', sort: 3 },
  ];
  const result = new Map();

  for (const category of categories) {
    const item = await upsertBySlug('pc_categories', { ...category, published: true });
    result.set(category.slug, item);
  }

  return result;
}

async function loadSubcategories() {
  const response = await directus('/items/pc_subcategories?limit=1000&fields=*');
  const map = new Map();
  for (const item of response.data || []) {
    map.set(`${item.category_slug}:${item.slug}`, item);
  }
  return map;
}

async function ensureSubcategory(normalized, subcategoriesByKey) {
  const category = broadCategories.get(normalized.categorySlug);
  const slug = `${normalized.categorySlug}-${normalized.sourceCategorySlug || normalized.subcategory}`;
  const key = `${normalized.categorySlug}:${slug}`;
  const payload = {
    name: normalized.sourceCategoryName || titleCase(normalized.subcategory),
    slug,
    description: '',
    icon: iconForSubcategory(normalized.subcategory),
    category_id: category.id,
    category_slug: normalized.categorySlug,
    sort: normalized.sort,
    published: true,
  };
  const existing = subcategoriesByKey.get(key);

  if (existing) {
    const updated = await directus(`/items/pc_subcategories/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    stats.subcategories.updated += 1;
    subcategoriesByKey.set(key, updated.data);
    return updated.data;
  }

  const created = await directus('/items/pc_subcategories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  stats.subcategories.created += 1;
  subcategoriesByKey.set(key, created.data);
  return created.data;
}

async function uploadProductImages(product) {
  const urls = [];

  for (const [index, image] of (product.images || []).entries()) {
    const localPath = normalizeLocalPath(image.localPath || product.image);
    if (!localPath) {
      continue;
    }

    try {
      const url = await uploadFile(localPath, product, image, index);
      urls.push(url);
    } catch (error) {
      stats.images.failed += 1;
      stats.failures.push({
        slug: product.slug,
        image: localPath,
        error: error.message,
      });
    }
  }

  return urls;
}

async function uploadFile(localPath, product, image, index) {
  const absolutePath = path.resolve(root, localPath);
  const cacheKey = path.relative(root, absolutePath).replace(/\\/g, '/');

  if (fileCache[cacheKey]) {
    stats.images.reused += 1;
    return fileCache[cacheKey].url;
  }

  const filename = path.basename(absolutePath);
  const existing = await findDirectusFile(filename);
  if (existing) {
    const url = `${credentials.url}/assets/${existing.id}`;
    fileCache[cacheKey] = { id: existing.id, url };
    stats.images.reused += 1;
    return url;
  }

  const bytes = await fs.readFile(absolutePath);
  const form = new FormData();
  form.append('title', `${product.title} ${index + 1}`.slice(0, 255));
  form.append('file', new Blob([bytes]), filename);

  const response = await directus('/files', {
    method: 'POST',
    body: form,
  });
  const url = `${credentials.url}/assets/${response.data.id}`;
  fileCache[cacheKey] = { id: response.data.id, url };
  stats.images.uploaded += 1;
  return url;
}

async function findDirectusFile(filename) {
  const params = new URLSearchParams({
    'filter[filename_download][_eq]': filename,
    limit: '1',
    fields: 'id,filename_download',
  });
  const response = await directus(`/files?${params.toString()}`);
  return response.data?.[0] || null;
}

function buildDirectusProductPayload(product, normalized, subcategory, imageUrls, sort) {
  const image = imageUrls[0] || product.imageUrl || '';
  const images = imageUrls.length ? imageUrls : [image].filter(Boolean);
  const brand = guessBrand(product);
  const description = cleanText(product.description || product.shortDescription || product.title);
  const price = Number(product.price) || 0;
  const directusPrice = Math.min(price, 99999.99);

  const payload = {
    title: product.title,
    slug: product.slug,
    description,
    category: normalized.productCategory,
    subcategory: normalized.subcategory,
    price: directusPrice,
    discounted_price: product.onSale && product.salePrice > 0 ? Number(product.salePrice) : null,
    image,
    images,
    specifications: {
      brand,
      model: product.title,
      sourceCategoryName: normalized.sourceCategoryName,
      sourceCategorySlug: normalized.sourceCategorySlug,
      attributes: product.attributes || [],
      tags: product.tags || [],
      admin: {
        source: 'legacy-import',
        sourceId: String(product.legacyId || product.id || product.slug),
        productType: productTypeFor(normalized),
        brand,
        categoryId: String(broadCategories.get(normalized.categorySlug)?.id || ''),
        subcategoryId: String(subcategory.id || ''),
        discountPrice: product.onSale && product.salePrice > 0 ? Number(product.salePrice) : null,
        discountPercent: null,
        currency: product.currency || 'MXN',
        sku: product.sku || '',
        originalImportedPrice: price !== directusPrice ? price : null,
        pricingMode: 'manual',
        syncEnabled: false,
        syncProvider: '',
        providerProductId: '',
        providerSku: '',
        lastPriceSyncedAt: null,
        lastSyncStatus: 'manual',
        lastSyncError: null,
        gallery: images,
        tipo: normalized.sourceCategoryName,
        internalNotes: 'Imported from legacy catalog package',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    },
    stock: product.inStock ? 1 : 0,
    low_stock_alert: 1,
    featured: false,
    published: true,
    sort: sort + 1,
    meta_title: product.title,
    meta_description: description.slice(0, 155),
    keywords: [
      normalized.sourceCategoryName,
      brand,
      ...(product.tags || []).map((tag) => tag.name),
    ].filter(Boolean),
  };

  return payload;
}

function normalizeProduct(product) {
  const sourceCategorySlug = slugify(product.category?.slug || product.category?.name || 'sin-categoria');
  const sourceCategoryName = product.category?.name || 'Sin categoria';
  const subcategory = classifySubcategory(sourceCategorySlug, product.title);
  const categorySlug = classifyBroadCategory(subcategory, sourceCategorySlug);

  return {
    sourceCategorySlug,
    sourceCategoryName,
    subcategory,
    categorySlug,
    productCategory: categorySlugToProductCategory(categorySlug),
    sort: sortForSubcategory(subcategory),
  };
}

function classifyBroadCategory(subcategory, sourceCategorySlug) {
  if (['pc-gaming', 'pc-cotizacion'].includes(sourceCategorySlug)) {
    return 'ensambles';
  }

  if ([
    'keyboard',
    'mouse',
    'monitor',
    'headset',
    'mousepad',
    'speaker',
    'chair',
    'controller',
    'microphone',
    'camera',
    'capture-card',
  ].includes(subcategory)) {
    return 'perifericos';
  }

  return 'componentes';
}

function classifySubcategory(categorySlug, title) {
  const text = `${categorySlug} ${title}`.toLowerCase();
  if (includesAny(text, ['procesador', 'processor', 'ryzen', 'core-i', 'intel-core'])) return 'cpu';
  if (includesAny(text, ['tarjeta-grafica', 'grafica', 'geforce', 'radeon', 'rtx', 'gtx'])) return 'gpu';
  if (includesAny(text, ['memoria', 'ram', 'ddr4', 'ddr5'])) return 'ram';
  if (includesAny(text, ['almacenamiento', 'ssd', 'hdd', 'nvme', 'disco-duro'])) return 'storage';
  if (includesAny(text, ['tarjeta-madre', 'motherboard', 'b550', 'b650', 'x670', 'z790'])) return 'motherboard';
  if (includesAny(text, ['fuente', 'power-supply', 'psu'])) return 'power-supply';
  if (includesAny(text, ['enfriamiento', 'ventilador', 'cooler', 'cooling', 'pasta-termica'])) return 'cooling';
  if (includesAny(text, ['gabinete', 'case'])) return 'case';
  if (includesAny(text, ['teclado', 'keyboard'])) return 'keyboard';
  if (includesAny(text, ['mousepad'])) return 'mousepad';
  if (includesAny(text, ['mouse', 'raton'])) return 'mouse';
  if (includesAny(text, ['monitor'])) return 'monitor';
  if (includesAny(text, ['audifono', 'audifonos', 'headset', 'bocina', 'bocinas'])) return text.includes('bocina') ? 'speaker' : 'headset';
  if (includesAny(text, ['silla'])) return 'chair';
  if (includesAny(text, ['control', 'mando'])) return 'controller';
  if (includesAny(text, ['microfono'])) return 'microphone';
  if (includesAny(text, ['camara'])) return 'camera';
  if (includesAny(text, ['capturadora'])) return 'capture-card';
  return 'accessory';
}

function categorySlugToProductCategory(categorySlug) {
  if (categorySlug === 'ensambles') return 'assembled';
  if (categorySlug === 'perifericos') return 'peripheral';
  return 'component';
}

function productTypeFor(normalized) {
  if (normalized.productCategory === 'assembled') return 'gabinete';
  if (normalized.productCategory === 'peripheral') return 'periferico';
  return normalized.subcategory === 'case' ? 'gabinete' : 'componente';
}

function guessBrand(product) {
  const text = `${product.description || ''} ${product.title || ''}`;
  const brandMatch = text.match(/Marca\s+([A-Za-z0-9+.\-\s]+?)(?:\s+Tamano|\s+Tama| Tecnologia|\s+Color|\s+Modelo|\s+Series|\s+Factor|\s+Capacidad|$)/i);
  if (brandMatch?.[1]) {
    return cleanText(brandMatch[1]).slice(0, 60);
  }

  const knownBrands = [
    'ADATA', 'AMD', 'ASUS', 'AORUS', 'Cooler Master', 'Corsair', 'EVGA', 'Gigabyte',
    'HyperX', 'Intel', 'Kingston', 'Logitech', 'MSI', 'NVIDIA', 'NZXT', 'Razer',
    'Samsung', 'Seagate', 'Thermaltake', 'Western Digital', 'XPG', 'Yeyian',
  ];
  const normalizedTitle = product.title.toLowerCase();
  return knownBrands.find((brand) => normalizedTitle.includes(brand.toLowerCase())) || '';
}

function iconForSubcategory(subcategory) {
  const icons = {
    cpu: 'fa-microchip',
    gpu: 'fa-video',
    ram: 'fa-memory',
    storage: 'fa-hdd',
    motherboard: 'fa-server',
    'power-supply': 'fa-plug',
    cooling: 'fa-fan',
    case: 'fa-cube',
    keyboard: 'fa-keyboard',
    mouse: 'fa-mouse',
    monitor: 'fa-tv',
    headset: 'fa-headphones',
    mousepad: 'fa-square',
    chair: 'fa-chair',
    controller: 'fa-gamepad',
    microphone: 'fa-microphone',
    camera: 'fa-camera',
  };
  return icons[subcategory] || 'fa-tag';
}

function sortForSubcategory(subcategory) {
  const order = ['cpu', 'gpu', 'ram', 'storage', 'motherboard', 'power-supply', 'cooling', 'case', 'keyboard', 'mouse', 'monitor', 'headset'];
  const index = order.indexOf(subcategory);
  return index === -1 ? 99 : index + 1;
}

async function findBySlug(collection, slug) {
  const params = new URLSearchParams({
    'filter[slug][_eq]': slug,
    limit: '1',
  });
  const response = await directus(`/items/${collection}?${params.toString()}`);
  return response.data?.[0] || null;
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

async function readJson(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw.replace(/^\uFEFF/, ''));
  } catch (error) {
    if (filePath === productsPath) {
      throw error;
    }
    return fallback;
  }
}

function normalizeLocalPath(value) {
  if (!value) return '';
  return String(value);
}

function includesAny(value, needles) {
  return needles.some((needle) => value.includes(needle));
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleCase(value) {
  return String(value)
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
