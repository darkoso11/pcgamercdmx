import { RenderMode, ServerRoute } from '@angular/ssr';
import { adminRoute } from './features/admin/admin-route.config';

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
    path: adminRoute('**'),
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
