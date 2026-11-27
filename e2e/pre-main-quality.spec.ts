import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { setupAssemblyCatalog } from './support/assembly-catalog-fixtures';

async function setupGallery(page: Page): Promise<void> {
  // Keyboard and color checks must not depend on editable CMS content.
  await page.route('**/items/pc_gallery_images?**', route => route.fulfill({
    json: { data: [{
      id: 1, src: '/assets/img/leon.png', title: 'Custom Build A',
      alt: 'PC de prueba', description: 'Ensamble de prueba', category: 'custom',
      tags: ['rgb'], author: 'Taller', date: null, published: true, sort_order: 0,
    }] },
  }));
  await page.route('**/items/pc_gallery_settings/1?**', route => route.fulfill({
    json: { data: {
      heading: 'Galería de prueba', subtitle: 'Ensambles',
      seo_title: 'Galería | PC Gamer CDMX', seo_description: 'Ensambles de prueba',
      social_image_id: 1,
    } },
  }));
}

test('related product cards expose native keyboard navigation', async ({ page }) => {
  await setupAssemblyCatalog(page);
  await page.goto('/ensambles/cpsula', { waitUntil: 'domcontentloaded' });

  const relatedProduct = page.locator('.product-card').first();
  await expect(relatedProduct).toBeVisible();
  await expect(relatedProduct).toHaveJSProperty('tagName', 'A');
  await expect(relatedProduct).toHaveAttribute('href', /\/(ensambles|productos)\//);

  await relatedProduct.focus();
  await expect(relatedProduct).toBeFocused();
});

test('gallery opens from the keyboard and restores focus after Escape', async ({ page }) => {
  await setupGallery(page);
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
  await setupGallery(page);
  await page.goto('/galeria', { waitUntil: 'domcontentloaded' });

  const activeFilter = page.getByRole('button', { name: 'Todas' });
  await expect(activeFilter).toHaveClass(/active/);
  await expect(activeFilter).toHaveCSS('color', 'rgb(2, 6, 23)');
  await expect(activeFilter).toHaveCSS('background-color', 'rgb(34, 211, 238)');
});
