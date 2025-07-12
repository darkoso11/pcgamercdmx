import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';  // Corregido de './app/app' a './app/app.component'
import { config } from './app/app.config.server';

export function getPrerenderParams() {
  return [
    // Productos
    { route: '/productos/pc-gamer-intel-i7' },
    { route: '/productos/pc-gamer-ryzen-5' },
    // Blogs
    { route: '/blog/como-armar-tu-pc' },
    { route: '/blog/guia-componentes-2024' }
    // Agrega aquí todos los slugs que quieras prerenderizar
  ];
}

const bootstrap = () => bootstrapApplication(AppComponent, config);

export default bootstrap;
