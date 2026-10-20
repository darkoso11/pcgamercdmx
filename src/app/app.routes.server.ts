import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { adminRoute } from './features/admin/admin-route.config';
import { ProductsService } from './features/products/services/products.service';

export const serverRoutes: ServerRoute[] = [
  ...['productos', 'productos/perifericos', 'productos/hardware-accesorios'].map((path): ServerRoute => ({ path, renderMode: RenderMode.Prerender })),
  ...['perifericos', 'hardware-accesorios'].map((group): ServerRoute => ({
    path: `productos/${group}/:category`,
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const categories = await firstValueFrom(inject(ProductsService).getCatalogCategories(true));
      return categories.filter(category => category.group === group)
        .flatMap(category => (category.aliases ?? [category.slug]).map(alias => ({ category: alias })));
    },
  })),
  {
    path: 'ensambles/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'colaboradores/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'productos/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Client
  },
  {
    path: adminRoute('**'),
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
