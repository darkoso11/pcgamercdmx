import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('September commercial pages', () => {
  afterEach(() => document.querySelectorAll('script[data-seo-schema="page"]').forEach(script => script.remove()));
  const pages = [
    ['pc-para-edicion-de-audio-y-video', 'PC para edición de audio y video', 6],
    ['workstation', 'Venta de workstation escritorio para diseño, edición y renderizado', 6],
    ['streaming-pc', 'PC para streaming de alto rendimiento', 6],
    ['componentes-para-pc-gamer', 'Componentes PC Gamer', 14],
  ] as const;

  for (const [path, heading, count] of pages) {
    it(`provides a dedicated route for ${path}`, () => {
      expect(routes.some(route => route.path === path && !!route.loadComponent)).toBeTrue();
    });
    it(`renders ${path} and its FAQ schema without catalog requests`, async () => {
      const route = routes.find(item => item.path === path);
      expect(route).toBeDefined();
      if (!route) return;
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/' + path);
      const el = harness.routeNativeElement!;
      expect(el.querySelectorAll('h1').length).toBe(1);
      expect(el.querySelector('h1')?.textContent).toBe(heading);
      expect(el.querySelectorAll('[data-product-card]').length).toBe(count);
      expect(el.querySelectorAll('details').length).toBe(4);
      expect(el.querySelector('a[href="/ensambles/hyperion"]')).toBeNull();
      expect(el.querySelector('a[href="/ensambles/workstation"]')).toBeNull();
      expect(el.querySelector('a[href="/pc-gamer-gama-media/"]')).toBeNull();
      const faq = JSON.parse(document.getElementById('commercial-faq-schema')!.textContent!);
      expect(faq.mainEntity.length).toBe(4);
      expect(faq.mainEntity[0].name).toBe(el.querySelector('summary')?.textContent?.trim());
    });
  }

  it('replaces content and FAQ when navigating between commercial pages', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/streaming-pc');
    await harness.navigateByUrl('/componentes-para-pc-gamer');
    expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe('Componentes PC Gamer');
    expect(harness.routeNativeElement!.querySelectorAll('[data-product-card]').length).toBe(14);
    expect(document.querySelectorAll('#commercial-faq-schema').length).toBe(1);
    expect(document.getElementById('commercial-faq-schema')!.textContent).toContain('¿Cuáles son los principales componentes de una PC gamer?');
  });
});
