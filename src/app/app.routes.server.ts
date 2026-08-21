import { RenderMode, ServerRoute } from '@angular/ssr';
import { adminRoute } from './features/admin/admin-route.config';

export const serverRoutes: ServerRoute[] = [
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
