import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
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

const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;
