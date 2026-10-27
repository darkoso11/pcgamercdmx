export async function setupMockEditor(page: import('@playwright/test').Page, onWrite: () => void, overrides: Record<string, unknown> = {}) {
  page.on('dialog', dialog => dialog.accept());
  await page.addInitScript(() => localStorage.setItem('pcgamercdmx_directus_access_token', 'test-editor-session'));
  const post = { id: 1, title: 'Versión actual', slug: 'version-actual', summary: 'Resumen válido de prueba editorial.',
    category: 1, tags: [], published: false, published_at: null, date_updated: '2026-10-25T12:00:00Z',
    sections: [{ title: 'Sección', text: '<p>Contenido actual</p>', images: [] }], cover_image: null, ...overrides };
  await page.route('https://cms.test.pcgamercdmx.com/**', async route => {
    if (!['GET', 'OPTIONS'].includes(route.request().method())) onWrite();
    const path = new URL(route.request().url()).pathname;
    let data: unknown = [];
    if (path === '/items/pc_blog_posts') data = [{ id: 2, title: 'Guía pública', slug: 'guia-publica' }];
    if (path === '/items/pc_products') data = [{ title: 'Equipo público', slug: 'equipo-publico' }];
    if (path === '/users/me') data = { id: 'test-editor' };
    if (path === '/items/pc_blog_posts/1') data = post;
    if (path === '/items/pc_blog_categories') data = [{ id: 1, name: 'Guías', slug: 'guias' }];
    if (path === '/revisions') data = [{ id: 7, activity: { timestamp: '2026-10-24T12:00:00Z' } }];
    if (path === '/revisions/7') data = { collection: 'pc_blog_posts', item: '1', data: { ...post, title: 'Versión anterior', slug: 'url-antigua' } };
    await route.fulfill({ json: { data }, headers: { 'access-control-allow-origin': '*' } });
  });
}
