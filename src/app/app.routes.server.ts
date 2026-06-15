import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'ensambles/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'colaboradores/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'productos/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
