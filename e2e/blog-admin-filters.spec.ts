import { expect, test } from '@playwright/test';
import { setupMockEditor } from './support/blog-editor-fixtures';

test('applies state, inclusive displayed dates, tags and taxonomy automatically', async ({ page }) => {
  await setupMockEditor(page, () => {});
  const records = [
    { id: 1, title: 'Guía Intel', category: '1', subcategory: 'a', tags: ['Intel', 'CPU'], published: false, date_created: '2026-10-26T18:00:00Z' },
    { id: 2, title: 'Artículo público', category: '2', subcategory: 'b', tags: ['Gaming'], published: true, published_at: '2025-01-01T06:00:00Z', date_created: '2024-12-31T22:00:00Z' },
    { id: 3, title: 'Guía futura', category: '1', subcategory: 'a', tags: ['GPU'], published: true, published_at: '2099-01-01T00:00:00Z', date_created: '2024-12-31T23:00:00Z' },
    { id: 4, title: 'Borrador sin fecha', category: '1', published: false },
  ];
  await page.route(url => url.pathname === '/items/pc_blog_posts', route => route.fulfill({ json: { data: records } }));
  await page.route(url => url.pathname === '/items/pc_blog_categories', route => route.fulfill({ json: { data: [{ id: 1, name: 'Guías' }, { id: 2, name: 'Componentes' }] } }));
  await page.route(url => url.pathname === '/items/pc_blog_subcategories', route => route.fulfill({ json: { data: [{ id: 'a', name: 'Presupuesto', category_id: '1' }, { id: 'b', name: 'Hardware', category_id: '2' }] } }));
  await page.goto('/control-pcg-cdmx-2026/blog');
  const rows = page.locator('tbody tr');
  await expect(rows).toHaveCount(4);
  await page.getByLabel('Estado', { exact: true }).selectOption('false');
  await expect(rows).toHaveCount(2);
  await expect(rows).toContainText(['Guía Intel', 'Borrador sin fecha']);
  await page.getByLabel('Fecha desde', { exact: true }).fill('2024-12-31');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText(['Guía Intel']);
  await page.getByLabel('Fecha hasta', { exact: true }).fill('2026-10-26');
  await expect(rows).toHaveCount(1);
  await page.getByLabel('Estado', { exact: true }).selectOption('true');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText(['Artículo público']);
  await page.getByLabel('Estado', { exact: true }).selectOption('scheduled');
  await expect(rows).toHaveCount(1);
  await expect(rows).toContainText(['Guía futura']);
  await page.getByRole('button', { name: 'Limpiar Filtros', exact: true }).click();
  await page.getByLabel('Fecha desde', { exact: true }).fill('2024-12-31');
  await page.getByLabel('Fecha hasta', { exact: true }).fill('2024-12-31');
  await expect(rows).toHaveCount(2);
  await expect(rows).toContainText(['Artículo público', 'Guía futura']);
  await page.getByRole('button', { name: 'Limpiar Filtros', exact: true }).click();
  await page.getByLabel('Buscar por tags', { exact: true }).fill('Intel, Gaming');
  await expect(rows).toHaveCount(2);
  await expect(rows).toContainText(['Guía Intel', 'Artículo público']);
  await page.getByRole('button', { name: 'Limpiar Filtros', exact: true }).click();
  await page.getByLabel('Buscar por título', { exact: true }).fill('guia');
  await expect(rows).toHaveCount(2);
  await expect(rows).toContainText(['Guía Intel', 'Guía futura']);
  await page.getByLabel('Categoría', { exact: true }).selectOption('1');
  await page.getByLabel('Subcategoría', { exact: true }).selectOption('a');
  await expect(rows).toHaveCount(2);
  await page.getByLabel('Categoría', { exact: true }).selectOption('2');
  await expect(page.getByLabel('Subcategoría', { exact: true })).toHaveValue('');
  await expect(rows).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar Filtros', exact: true }).click();
  await expect(rows).toHaveCount(4);
  await page.getByLabel('Fecha desde', { exact: true }).fill('2026-10-27');
  await page.getByLabel('Fecha hasta', { exact: true }).fill('2026-10-26');
  await expect(page.getByRole('alert')).toContainText('fecha');
  await expect(rows).toHaveCount(0);
});
