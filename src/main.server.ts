import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';  // Corregido de './app/app' a './app/app.component'
import { config } from './app/app.config.server';
import { BlogComponent } from './app/features/blog/blog.component';
import { ProductsComponent } from './app/features/products/products.component';

export function getPrerenderParams() {
  return [
    // Productos
     {
    path: 'productos/:slug',
    component: ProductsComponent,
    getPrerenderParams: () => [
      { slug: 'laptop-dell-xps' },
      { slug: 'monitor-lg-4k' }
    ]
  },
  // Blogs
  {
    path: 'blog/:slug',
    component: BlogComponent,
    getPrerenderParams: () => [
      { slug: 'como-armar-tu-pc' },
      { slug: 'guia-componentes-2024' }
    ]
  }
  // Agrega aquí todos los slugs que quieras prerenderizar
];
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
