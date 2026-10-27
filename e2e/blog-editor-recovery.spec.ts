import { setupMockEditor } from './support/blog-editor-fixtures';
import { expect, test } from '@playwright/test';

test('recovers an incomplete local draft after reload without writing to the CMS', async ({ page }) => {
  let writes = 0;
  await setupMockEditor(page, () => writes++);
  await page.goto('/control-pcg-cdmx-2026/blog/1/edit');
  const title = page.getByPlaceholder('Ej: Mi primer artículo');
  await expect(title).toHaveValue('Versión actual');
  await title.fill('Edición local pendiente');
  await expect(page.getByText('Copia local:', { exact: false })).toBeVisible();
  await expect(page.getByText('Copia local pendiente…', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Recuperar copia local', exact: true })).toBeVisible();
  await expect(title).toHaveValue('Versión actual');
  await page.getByRole('button', { name: 'Recuperar copia local', exact: true }).click();
  await expect(title).toHaveValue('Edición local pendiente');
  expect(writes).toBe(0);
});

test('opens history locally and keeps the current URL', async ({ page }) => {
  let writes = 0;
  await setupMockEditor(page, () => writes++);
  await page.goto('/control-pcg-cdmx-2026/blog/1/edit');
  const title = page.getByPlaceholder('Ej: Mi primer artículo');
  await expect(title).toHaveValue('Versión actual');
  await page.getByRole('button', { name: 'Ver historial de versiones', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir versión 7', exact: true }).click();
  await expect(title).toHaveValue('Versión anterior');
  await expect(page.getByPlaceholder('mi-primer-articulo')).toHaveValue('version-actual');
  await expect(page.getByText(/abierta para revisión/)).toBeVisible();
  expect(writes).toBe(0);
});
