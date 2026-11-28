import { expect, test } from '@playwright/test';

test('home keeps the video centered and the welcome in the desktop social bar', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.welcome-typed')).toHaveText('Bienvenido a Pc Gamer CDMX.');
  for (const [width, height] of [[360,800], [384,833], [390,844], [768,1024], [1366,768], [1440,900], [1900,928], [844,390], [1366,500]]) {
    await page.setViewportSize({ width, height });
    const geometry = await page.evaluate(() => {
      const video = document.querySelector('video')!.getBoundingClientRect();
      const heading = document.querySelector('h1')!.getBoundingClientRect();
      const bar = document.querySelector('.hero-bottom-bar')!.getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth > innerWidth, center: video.x + video.width / 2,
        headingTop: heading.top, headingBottom: heading.bottom, barTop: bar.top, barBottom: bar.bottom,
        background: getComputedStyle(document.querySelector('h1')!).backgroundImage };
    });
    expect(geometry.overflow).toBe(false);
    expect(Math.abs(geometry.center - width / 2)).toBeLessThan(1);
    expect(geometry.background).toBe('none');
    if (width >= 768) {
      expect(geometry.headingTop).toBeGreaterThanOrEqual(geometry.barTop);
      expect(geometry.headingBottom).toBeLessThanOrEqual(geometry.barBottom);
    }
  }
});

test('home rotates the logo banner automatically without arrow buttons', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const image = page.locator('.hero-top-banner img');
  await expect(image).toHaveAttribute('src', /leon-160/);
  await expect(page.locator('.hero-top-banner .slider-arrow')).toHaveCount(0);
  await expect(image).not.toHaveAttribute('src', /leon-160/, { timeout: 12000 });
});

test('home playback starts muted and responds to sound and pause controls', async ({ page }) => {
  await page.goto('/');
  const video = page.locator('video');
  await expect.poll(() => video.evaluate(v => (v as HTMLVideoElement).currentTime)).toBeGreaterThan(0);
  await expect(video).toHaveJSProperty('muted', true);
  await page.getByRole('button', { name: 'Activar sonido', exact: true }).click();
  await expect(video).toHaveJSProperty('muted', false);
  await page.getByRole('button', { name: 'Desactivar sonido', exact: true }).click();
  await expect(video).toHaveJSProperty('muted', true);
  await page.getByRole('button', { name: 'Pausar video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await page.getByRole('button', { name: 'Reproducir video', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', false);
});

test('home respects reduced motion and recovers from an invalid media resource', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('video')).toHaveAttribute('src', /home-pc-gamer/);
  await expect(page.locator('video')).toHaveJSProperty('paused', true);
  await expect(page.locator('.media-fallback')).toBeVisible();
  await page.locator('video').evaluate(v => {
    (v as HTMLVideoElement).src = 'data:video/mp4;base64,AAAA';
    (v as HTMLVideoElement).load();
  });
  await expect(page.locator('.media-status')).toContainText('no está disponible');
  await expect(page.locator('.media-fallback')).toBeVisible();
  await expect(page.locator('.media-controls')).toHaveCount(0);
});

test('home offers manual playback when the browser rejects autoplay', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Blocked', 'NotAllowedError'));
  });
  await page.goto('/');
  await expect(page.locator('.media-status')).toContainText('Pulsa Reproducir');
  await expect(page.locator('.media-fallback')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reproducir video', exact: true })).toBeVisible();
});
