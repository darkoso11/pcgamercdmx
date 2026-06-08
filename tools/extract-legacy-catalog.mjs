import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const apiBase = process.env.LEGACY_CATALOG_API;
const outputDir = path.resolve(
  root,
  process.env.LEGACY_CATALOG_OUTPUT_DIR || 'data/legacy-catalog'
);
const imagesDir = path.join(outputDir, 'images');
const perPage = Number(process.env.LEGACY_CATALOG_PER_PAGE || 100);
const imageConcurrency = Number(process.env.LEGACY_IMAGE_CONCURRENCY || 6);

await fs.mkdir(imagesDir, { recursive: true });

if (!apiBase) {
  throw new Error('Set LEGACY_CATALOG_API to extract the legacy catalog.');
}

const products = await fetchAllProducts();
const imageStats = await downloadAllImages(products);
const normalized = products.map(normalizeProduct);

await fs.writeFile(
  path.join(outputDir, 'products.raw.json'),
  `${JSON.stringify(products, null, 2)}\n`,
  'utf8'
);
await fs.writeFile(
  path.join(outputDir, 'products.normalized.json'),
  `${JSON.stringify(normalized, null, 2)}\n`,
  'utf8'
);
await fs.writeFile(
  path.join(outputDir, 'summary.json'),
  `${JSON.stringify({
    source: apiBase,
    downloadedAt: new Date().toISOString(),
    productCount: products.length,
    imageCount: imageStats.total,
    imageDownloaded: imageStats.downloaded,
    imageSkipped: imageStats.skipped,
    imageFailed: imageStats.failed.length,
    failedImages: imageStats.failed,
  }, null, 2)}\n`,
  'utf8'
);

console.log(JSON.stringify({
  productCount: products.length,
  imageCount: imageStats.total,
  imageDownloaded: imageStats.downloaded,
  imageSkipped: imageStats.skipped,
  imageFailed: imageStats.failed.length,
  outputDir,
}, null, 2));

async function fetchAllProducts() {
  const first = await fetchProductPage(1);
  const totalPages = Number(first.headers.get('x-wp-totalpages') || 1);
  const total = Number(first.headers.get('x-wp-total') || first.items.length);
  const products = [...first.items];

  console.log(`Fetching ${total} products from ${totalPages} pages...`);

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await fetchProductPage(page);
    products.push(...result.items);
    console.log(`Fetched page ${page}/${totalPages} (${products.length}/${total})`);
  }

  return products;
}

async function fetchProductPage(page) {
  const url = new URL(apiBase);
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('page', String(page));

  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Product page ${page} failed: ${response.status} ${response.statusText}`);
  }

  return {
    headers: response.headers,
    items: await response.json(),
  };
}

async function downloadAllImages(products) {
  const jobs = [];
  for (const product of products) {
    for (const [index, image] of (product.images || []).entries()) {
      if (!image?.src) {
        continue;
      }

      jobs.push({
        productId: product.id,
        productSlug: product.slug || slugify(product.name || `product-${product.id}`),
        imageId: image.id || index + 1,
        index,
        src: image.src,
      });
    }
  }

  const stats = {
    total: jobs.length,
    downloaded: 0,
    skipped: 0,
    failed: [],
  };

  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(imageConcurrency, jobs.length) },
    async () => {
      while (cursor < jobs.length) {
        const job = jobs[cursor];
        cursor += 1;
        const result = await downloadImage(job).catch((error) => ({
          status: 'failed',
          error: error.message,
          job,
        }));

        if (result.status === 'downloaded') {
          stats.downloaded += 1;
        } else if (result.status === 'skipped') {
          stats.skipped += 1;
        } else {
          stats.failed.push({
            productId: job.productId,
            src: job.src,
            error: result.error,
          });
        }

        const done = stats.downloaded + stats.skipped + stats.failed.length;
        if (done % 50 === 0 || done === jobs.length) {
          console.log(`Images ${done}/${jobs.length}`);
        }
      }
    }
  );

  await Promise.all(workers);
  return stats;
}

async function downloadImage(job) {
  const url = new URL(job.src);
  const extension = imageExtension(url.pathname);
  const filename = [
    String(job.productId || 'product'),
    slugify(job.productSlug).slice(0, 80),
    String(job.index + 1),
    String(job.imageId || job.index + 1),
  ].filter(Boolean).join('-') + extension;
  const filePath = path.join(imagesDir, filename);

  if (await fileExists(filePath)) {
    return { status: 'skipped', filePath };
  }

  const response = await fetchWithRetry(url);
  if (!response.ok) {
    throw new Error(`Image failed: ${response.status} ${response.statusText}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, bytes);
  return { status: 'downloaded', filePath };
}

function normalizeProduct(product) {
  const images = (product.images || []).map((image, index) => ({
    id: image.id ?? null,
    name: image.name ?? '',
    alt: image.alt ?? product.name ?? '',
    src: image.src,
    localPath: localImagePath(product, image, index),
  }));
  const category = product.categories?.[0] ?? null;
  const price = toMajorCurrency(product.prices?.price, product.prices?.currency_minor_unit);
  const regularPrice = toMajorCurrency(
    product.prices?.regular_price,
    product.prices?.currency_minor_unit
  );
  const salePrice = toMajorCurrency(
    product.prices?.sale_price,
    product.prices?.currency_minor_unit
  );

  return {
    source: 'legacy-catalog-extract',
    legacyId: product.id,
    title: product.name ?? '',
    slug: product.slug ?? '',
    permalink: product.permalink ?? '',
    sku: product.sku ?? '',
    category: category ? {
      id: category.id,
      name: category.name,
      slug: category.slug,
    } : null,
    price,
    regularPrice,
    salePrice,
    currency: product.prices?.currency_code ?? 'MXN',
    onSale: Boolean(product.on_sale),
    purchasable: Boolean(product.is_purchasable),
    inStock: Boolean(product.is_in_stock),
    stockStatus: product.stock_status ?? '',
    shortDescriptionHtml: product.short_description ?? '',
    descriptionHtml: product.description ?? '',
    shortDescription: htmlToText(product.short_description ?? ''),
    description: htmlToText(product.description ?? ''),
    image: images[0]?.localPath ?? images[0]?.src ?? '',
    imageUrl: images[0]?.src ?? '',
    images,
    tags: (product.tags || []).map((tag) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })),
    attributes: (product.attributes || []).map((attribute) => ({
      id: attribute.id,
      name: attribute.name,
      taxonomy: attribute.taxonomy,
      terms: (attribute.terms || []).map((term) => ({
        id: term.id,
        name: term.name,
        slug: term.slug,
      })),
    })),
  };
}

function localImagePath(product, image, index) {
  if (!image?.src) {
    return '';
  }

  const extension = imageExtension(new URL(image.src).pathname);
  const filename = [
    String(product.id || 'product'),
    slugify(product.slug || product.name || `product-${product.id}`).slice(0, 80),
    String(index + 1),
    String(image.id || index + 1),
  ].filter(Boolean).join('-') + extension;

  return path.posix.join('data/legacy-catalog/images', filename);
}

function toMajorCurrency(value, minorUnit = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }

  return number / (10 ** Number(minorUnit || 0));
}

function imageExtension(pathname) {
  const extension = path.extname(decodeURIComponent(pathname)).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(extension)) {
    return extension;
  }

  return '.jpg';
}

function htmlToText(value) {
  return value
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
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

async function fetchWithRetry(url, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          Accept: '*/*',
          'User-Agent': 'pcgamercdmx-importer/1.0',
        },
      });

      if (response.ok || attempt === attempts || response.status < 500) {
        return response;
      }
    } catch (error) {
      lastError = error;
    }

    await wait(500 * attempt);
  }

  if (lastError) {
    throw lastError;
  }

  return fetch(url);
}

async function fileExists(filePath) {
  return fs.access(filePath).then(() => true, () => false);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
