import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './features/blog/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Inicio | PC Gamer CDMX',
  },
  {
    path: 'contacto',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
    title: 'Contacto | PC Gamer CDMX',
    data: { description: 'Ponte en contacto con PC Gamer CDMX para consultas, soporte o información sobre nuestros productos y servicios.' }
  },
  
  // Rutas adicionales
  {
    path: 'productos',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'galeria',
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'sorteos',
    loadComponent: () => import('./features/giveaways/giveaways.component').then(m => m.GiveawaysComponent)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent)
  },
  {
    path: 'cotiza-tu-pc',
    loadComponent: () => import('./features/quotation/quotation.component').then(m => m.QuotationComponent)
  },

  // Blog routes
  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog-list.component').then(m => m.BlogListComponent),
    title: 'Blog | PC Gamer CDMX'
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./features/blog/article.component').then(m => m.ArticleComponent),
    title: 'Artículo | PC Gamer CDMX',
    data: { renderMode: 'dynamic' }
  },

  // Admin Blog routes
  {
    path: 'admin',
    loadComponent: () => import('./features/blog/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    title: 'Admin | PC Gamer CDMX',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog',
    loadComponent: () => import('./features/blog/admin/admin-article-list.component').then(m => m.AdminArticleListComponent),
    title: 'Admin Blog | PC Gamer CDMX',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog/new',
    loadComponent: () => import('./features/blog/admin/admin-article-editor.component').then(m => m.AdminArticleEditorComponent),
    title: 'Nuevo Artículo | PC Gamer CDMX',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog/categories',
    loadComponent: () => import('./features/blog/admin/admin-categories.component').then(m => m.AdminCategoriesComponent),
    title: 'Categorías | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog/:id/edit',
    loadComponent: () => import('./features/blog/admin/admin-article-editor.component').then(m => m.AdminArticleEditorComponent),
    title: 'Editar Artículo | PC Gamer CDMX',
    data: { renderMode: 'dynamic' }
    ,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blog/login',
    loadComponent: () => import('./features/blog/admin/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Admin Login | PC Gamer CDMX'
  },

  // Ruta fallback
  {
    path: '**',
    redirectTo: ''
  }
];
