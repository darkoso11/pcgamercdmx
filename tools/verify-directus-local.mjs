import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const localUrl = process.env.PCGAMERCDMX_LOCAL_URL || 'http://127.0.0.1:4200';
const directusUrl = process.env.DIRECTUS_URL || 'https://cms.test.pcgamercdmx.com';

const credentials = readCredentials();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const consoleErrors = [];

page.on('console', (message) => {
  if (message.type() === 'error') {
    consoleErrors.push(message.text());
  }
});
page.on('pageerror', (error) => consoleErrors.push(error.message));

try {
  await page.goto(`${localUrl}/productos`, { waitUntil: 'networkidle' });
  const catalogVisible = await page
    .getByText('Apex Starter 1080p')
    .first()
    .isVisible()
    .catch(() => false);

  await page.goto(`${localUrl}/admin/blog/login`, { waitUntil: 'networkidle' });
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole('button', { name: /Ingresar/i }).click();
  await page.waitForURL('**/admin', { timeout: 15000 });

  const token = await page.evaluate(() =>
    localStorage.getItem('pcgamercdmx_directus_access_token')
  );

  if (!token) {
    throw new Error('Angular login did not store Directus access token.');
  }

  const crudSmoke = await runCrudSmoke(page, token);

  await page.goto(`${localUrl}/admin/products/list`, { waitUntil: 'networkidle' });
  const adminListVisible = await page
    .getByText('Apex Starter 1080p')
    .first()
    .isVisible()
    .catch(() => false);

  console.log(JSON.stringify({
    catalogVisible,
    loginStoredToken: Boolean(token),
    crudSmoke,
    adminListVisible,
    consoleErrorCount: consoleErrors.length,
    consoleErrors: consoleErrors.slice(0, 5),
  }, null, 2));
} finally {
  await browser.close();
}

function readCredentials() {
  const email = process.env.DIRECTUS_EMAIL;
  const password = process.env.DIRECTUS_PASSWORD;

  if (email && password) {
    return { email, password };
  }

  const raw = fs.readFileSync(
    path.join(process.env.USERPROFILE || process.env.HOME || '', '.pcgamercdmx', 'directus-backend.txt'),
    'utf8'
  );

  const fileEmail = raw.match(/^\s*Admin email\s*[:=]\s*(.+?)\s*$/im)?.[1];
  const filePassword = raw.match(/^\s*Admin password\s*[:=]\s*(.+?)\s*$/im)?.[1];

  if (!fileEmail || !filePassword) {
    throw new Error('Missing local Directus credentials.');
  }

  return { email: fileEmail, password: filePassword };
}

async function runCrudSmoke(page, token) {
  const slug = `codex-crud-smoke-${Date.now()}`;
  const createResult = await page.evaluate(async ({ directusUrl, token, slug }) => {
    const response = await fetch(`${directusUrl}/items/pc_products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: 'Codex CRUD Smoke',
        slug,
        description: 'Registro temporal para validar CRUD desde Angular local.',
        category: 'component',
        subcategory: 'cpu',
        price: 1,
        discounted_price: null,
        image: 'https://placehold.co/600x400?text=Smoke',
        images: [],
        specifications: {
          admin: {
            productType: 'componente',
            brand: 'Codex',
            categoryId: '2',
            subcategoryId: '5',
          },
        },
        brand_logos: [],
        stock: 1,
        low_stock_alert: 1,
        featured: false,
        published: false,
        sort: 9999,
        meta_title: null,
        meta_description: null,
        keywords: ['smoke-test'],
      }),
    });

    return {
      ok: response.ok,
      status: response.status,
      body: await response.json().catch(() => null),
    };
  }, { directusUrl, token, slug });

  if (!createResult.ok) {
    throw new Error(`Create failed: ${createResult.status}`);
  }

  const id = createResult.body.data.id;
  const updateResult = await page.evaluate(async ({ directusUrl, token, id }) => {
    const response = await fetch(`${directusUrl}/items/pc_products/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: 'Codex CRUD Smoke Updated' }),
    });
    return { ok: response.ok, status: response.status };
  }, { directusUrl, token, id });

  if (!updateResult.ok) {
    throw new Error(`Update failed: ${updateResult.status}`);
  }

  const deleteResult = await page.evaluate(async ({ directusUrl, token, id }) => {
    const response = await fetch(`${directusUrl}/items/pc_products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return { ok: response.ok, status: response.status };
  }, { directusUrl, token, id });

  if (!deleteResult.ok) {
    throw new Error(`Delete failed: ${deleteResult.status}`);
  }

  return 'created-updated-deleted';
}
