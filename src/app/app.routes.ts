import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'productos', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
  { 
    path: 'productos/:slug', 
    loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent),
    data: { getPrerenderParams: true }
  },
  { path: 'categorias/:tag', loadComponent: () => import('./features/products/category.component').then(m => m.CategoryComponent) },
  { path: 'cotiza-tu-pc', loadComponent: () => import('./features/quotation/quotation.component').then(m => m.QuotationComponent) },
  { path: 'servicios', loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent) },
  { path: 'nosotros', loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent) },
  { path: 'contacto', loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent) },
  { path: 'blog', loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent) },
  { 
    path: 'blog/:slug', 
    loadComponent: () => import('./features/blog/blog-detail.component').then(m => m.BlogDetailComponent),
    data: { getPrerenderParams: true }
  },
  { path: 'sorteos', loadComponent: () => import('./features/giveaways/giveaways.component').then(m => m.GiveawaysComponent) },
  { path: 'galeria', loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent) },
  // ...rutas del admin si es necesario...
];
