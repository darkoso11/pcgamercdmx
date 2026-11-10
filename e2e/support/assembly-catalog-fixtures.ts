import type { Page } from '@playwright/test';
import path from 'node:path';

// These UI assertions require specific products, independently of CMS editorial changes.
export async function setupAssemblyCatalog(page: Page): Promise<void> {
  const products = ['sniker', 'shark', 'cpsula', 'robot'].map((slug, index) => ({
    id: `fixture-${slug}`,
    slug,
    title: slug.toUpperCase(),
    category: 'assembled',
    subcategory: 'gaming',
    published: true,
    stock: 5,
    price: 25000 + index * 1000,
    image: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01-480.webp',
    description: slug === 'shark'
      ? 'Equipo de prueba para juegos, edición y trabajo. '.repeat(12)
      : 'Equipo de prueba para juegos.',
    specifications: {
      processor: 'Procesador de prueba',
      motherboard: 'Tarjeta madre de prueba',
      ram: '32 GB',
      powerSupply: 'Fuente de prueba 750W',
      watts: 750,
      powerCertificate: '80+ Gold',
      powerCertificateImage: 'assets/img/certificaciones/80plusgold-80.webp',
    },
  }));

  await page.route('**/items/pc_products?**', route => route.fulfill({ json: { data: products } }));
  await page.route('**/items/pc_brands?**', route => route.fulfill({ json: { data: [] } }));
  await page.route('**/items/pc_offers?**', route => route.fulfill({ json: { data: [] } }));

  // Prerendered HTML contains live CMS TransferState, which would bypass the fixture.
  // Use the production CSR shell for these UI tests; SSR tests retain real route HTML.
  await page.route('http://127.0.0.1:4200/**', route => route.request().resourceType() === 'document'
    ? route.fulfill({ path: path.resolve('dist/pcgamercdmx/browser/index.csr.html'), contentType: 'text/html' })
    : route.continue());
}
