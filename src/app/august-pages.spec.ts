import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { environment as production } from '../environments/environment.prod';
import { HIGH_END_PC_SEO } from './features/high-end-pc/high-end-pc.seo';

describe('August landing URLs', () => {
  afterEach(() => document.querySelectorAll('script[data-seo-schema="page"]').forEach(s => s.remove()));
  for (const [path, heading] of [
    ['computadora-para-diseno-grafico', 'Computadora para Diseño Gráfico en CDMX'],
    ['pc-gamer-gama-media', 'PC Gamer Gama Media en CDMX'],
  ]) {
    it(`renders dedicated content and schemas at ${path}`, async () => {
      expect(routes.find(r => r.path === path)?.loadComponent).toBeDefined();
      if (!routes.some(r => r.path === path)) return;
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/' + path);
      expect(harness.routeNativeElement!.querySelector('h1')?.textContent).toBe(heading);
      expect(harness.routeNativeElement!.querySelectorAll('[data-product-card]').length).toBe(6);
      expect(harness.routeNativeElement!.querySelectorAll('details').length).toBe(4);
      expect(document.getElementById('commercial-collection-schema')?.textContent).toContain('/' + path);
    });
  }
  it('keeps the old high-end address as an alias to the requested URL', () => {
    expect(routes.find(r => r.path === 'pc-gamer-gama-alta')?.loadComponent).toBeDefined();
    expect(routes.find(r => r.path === 'pc-gamer-gama-alta-cdmx')?.redirectTo).toBe('pc-gamer-gama-alta');
    expect(HIGH_END_PC_SEO.canonicalUrl).toBe('https://pcgamercdmx.com/pc-gamer-gama-alta');
  });
  it('enables the supplied GA4 property in production', () => {
    expect(production.marketing.googleAnalyticsId).toBe('G-1RE1CQG7LC');
  });
});
