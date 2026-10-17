import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { ActivatedRouteSnapshot, RedirectCommand, Router, Routes } from '@angular/router';
import { CatalogCategory, catalogCategoryPath } from './catalog-categories';
import { ProductsService } from './services/products.service';

function categoryFor(route: ActivatedRouteSnapshot): CatalogCategory | undefined {
  return (route.parent!.data['catalogCategories'] as CatalogCategory[]).find(category =>
    category.group === route.data['catalogGroup'] && (category.aliases ?? [category.slug]).includes(route.paramMap.get('category')!));
}

const catalogComponent = () => import('./catalog.component').then(m => m.CatalogComponent);

export const CATALOG_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./products.component').then(m => m.ProductsComponent),
  resolve: {
    catalogProducts: () => inject(ProductsService).getCatalogProducts(),
    catalogCategories: () => inject(ProductsService).getCatalogCategories(isPlatformServer(inject(PLATFORM_ID))),
  },
  title: 'Productos | PC Gamer CDMX',
  data: {
    description: 'Catálogo de hardware, accesorios y periféricos disponibles en PC Gamer CDMX.',
    keywords: 'componentes pc, perifericos gamer, productos gamer, pc gamer cdmx',
  },
  children: [
    ...(['perifericos', 'hardware-accesorios'] as const).map(group => ({
      path: `${group}/:category`,
      loadComponent: catalogComponent,
      data: { catalogGroup: group },
      title: (route: ActivatedRouteSnapshot) => `${categoryFor(route)?.label ?? 'Productos'} | PC Gamer CDMX`,
      resolve: {
        catalogCategory: (route: ActivatedRouteSnapshot) => categoryFor(route) ?? new RedirectCommand(
          inject(Router).createUrlTree(['/productos', group], { queryParams: route.queryParams })),
        description: (route: ActivatedRouteSnapshot) => `Explora ${(categoryFor(route)?.label ?? 'productos').toLowerCase()} para tu PC y compara productos en PC Gamer CDMX.`,
        canonicalPath: (route: ActivatedRouteSnapshot) => {
          const category = categoryFor(route);
          return category ? `/${catalogCategoryPath(category)}` : `/productos/${group}`;
        },
      },
    })),
    {
      path: 'perifericos', loadComponent: catalogComponent,
      title: 'Perifericos gamer | PC Gamer CDMX',
      data: { catalogGroup: 'perifericos', description: 'Explora periféricos gamer: teclados, mouse, monitores, headsets, sillas y accesorios para completar tu setup.' },
    },
    {
      path: 'hardware-accesorios', loadComponent: catalogComponent,
      title: 'Hardware y accesorios para PC | PC Gamer CDMX',
      data: { catalogGroup: 'hardware-accesorios', description: 'Hardware, componentes, cables, adaptadores y accesorios para armar, actualizar o conectar tu PC.' },
    },
    { path: 'componentes', redirectTo: 'hardware-accesorios', pathMatch: 'full' },
    { path: ':slug', loadComponent: () => import('./product-detail.component').then(m => m.ProductDetailComponent), data: { seoType: 'product' } },
    { path: '', loadComponent: catalogComponent, pathMatch: 'full' },
  ],
}];
