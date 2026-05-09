const { test, chromium } = require('@playwright/test');
const fs = require('fs');

test('visual responsive smoke audit', async () => {
  const baseUrl = 'http://127.0.0.1:4200';
  const pages = [
    ['home', '/'],
    ['contact', '/contacto'],
    ['products', '/productos'],
    ['assemblies', '/ensambles'],
    ['quote', '/cotiza-tu-pc'],
  ];
  const viewports = [
    ['mobile', { width: 375, height: 812 }],
    ['tablet', { width: 768, height: 1024 }],
    ['desktop', { width: 1280, height: 900 }],
  ];
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const [viewportName, viewport] of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    for (const [pageName, path] of pages) {
      try {
        await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1200);
        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const viewportWidth = window.innerWidth;
          const overflowNodes = [...document.querySelectorAll('body *')]
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 && rect.height > 0 && rect.right > viewportWidth + 2;
            })
            .slice(0, 8)
            .map((element) => ({
              tag: element.tagName.toLowerCase(),
              className: typeof element.className === 'string' ? element.className.slice(0, 120) : '',
              text: (element.textContent || '').trim().slice(0, 80),
              right: Math.round(element.getBoundingClientRect().right),
            }));

          return {
            title: document.title,
            scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
            clientWidth: doc.clientWidth,
            overflowNodes,
            imagesWithoutAlt: [...document.images].filter((img) => !img.alt).length,
          };
        });

        await page.screenshot({
          path: `.qa/screenshots/${pageName}-${viewportName}.png`,
          fullPage: false,
        });

        results.push({ page: path, viewport: viewportName, ok: true, consoleErrors: [...consoleErrors], ...metrics });
        consoleErrors.length = 0;
      } catch (error) {
        results.push({ page: path, viewport: viewportName, ok: false, error: error.message, consoleErrors: [...consoleErrors] });
        consoleErrors.length = 0;
      }
    }

    await context.close();
  }

  await browser.close();
  fs.writeFileSync('.qa/visual-qa-results.json', JSON.stringify(results, null, 2));
});
