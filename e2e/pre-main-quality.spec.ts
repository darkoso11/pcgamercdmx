import { expect, test } from '@playwright/test';

test('related product cards expose native keyboard navigation', async ({ page }) => {
  await page.goto('/ensambles/cpsula', { waitUntil: 'domcontentloaded' });

  const relatedProduct = page.locator('.product-card').first();
  await expect(relatedProduct).toBeVisible();
  await expect(relatedProduct).toHaveJSProperty('tagName', 'A');
  await expect(relatedProduct).toHaveAttribute('href', /\/(ensambles|productos)\//);

  await relatedProduct.focus();
  await expect(relatedProduct).toBeFocused();
});

test('gallery opens from the keyboard and restores focus after Escape', async ({ page }) => {
  await page.goto('/galeria', { waitUntil: 'domcontentloaded' });

  const galleryCard = page.getByRole('button', { name: 'Abrir Custom Build A' });
  await galleryCard.focus();
  await page.keyboard.press('Enter');

  const dialog = page.getByRole('dialog', { name: 'Custom Build A' });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cerrar galería' })).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(galleryCard).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
});

test('gallery active filter keeps readable tokenized colors', async ({ page }) => {
  await page.goto('/galeria', { waitUntil: 'domcontentloaded' });

  const activeFilter = page.getByRole('button', { name: 'Todas' });
  await expect(activeFilter).toHaveClass(/active/);
  await expect(activeFilter).toHaveCSS('color', 'rgb(2, 6, 23)');
  await expect(activeFilter).toHaveCSS('background-color', 'rgb(34, 211, 238)');
});
