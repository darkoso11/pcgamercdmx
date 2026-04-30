import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { AuthGuard } from './features/admin/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Inicio | PC Gamer CDMX',
  },
  {
    path: 'ensambles',
    loadComponent: () => import('./features/assemblies/assemblies.component').then(m => m.AssembliesComponent),
    title: 'Ensambles | PC Gamer CDMX',
    data: { description: 'Explora ensambles de PC listos para gaming, streaming y trabajo creativo en PC Gamer CDMX.' }
  },
  {
    path: 'ensambles/:slug',
    loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Detalle de Ensamble | PC Gamer CDMX',
    data: { renderMode: 'dynamic' }
  },
  {
    path: 'productos/paquetes',
    redirectTo: 'ensambles',
    pathMatch: 'full'
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
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    children: [
      { path: 'perifericos', loadComponent: () => import('./features/products/peripherals/peripherals').then(m => m.Peripherals) },
      { path: 'componentes', loadComponent: () => import('./features/products/components/components').then(m => m.Components) },
      { path: ':slug', loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: '', loadComponent: () => import('./features/products/products-overview/products-overview').then(m => m.ProductsOverview) }
    ]
  },
  {
    path: 'nosotros',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent),
    title: 'Nosotros | PC Gamer CDMX',
    data: { description: 'Conoce la historia, trayectoria, equipo y colaboraciones detrás de PC Gamer CDMX.' }
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
    loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
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
    loadComponent: () => import('./features/admin/admin-login.component').then(m => m.AdminLoginComponent),
    title: 'Admin Login | PC Gamer CDMX'
  },

  // Admin Products routes
  {
    path: 'admin/products',
    loadComponent: () => import('./features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component').then(m => m.AdminProductsDashboardComponent),
    title: 'Admin Productos | PC Gamer CDMX',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/list',
    loadComponent: () => import('./features/products/admin/products/admin-product-list/admin-product-list.component').then(m => m.AdminProductListComponent),
    title: 'Productos | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/new',
    loadComponent: () => import('./features/products/admin/products/admin-product-editor/admin-product-editor.component').then(m => m.AdminProductEditorComponent),
    title: 'Nuevo Producto | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/:id/edit',
    loadComponent: () => import('./features/products/admin/products/admin-product-editor/admin-product-editor.component').then(m => m.AdminProductEditorComponent),
    title: 'Editar Producto | Admin',
    data: { renderMode: 'dynamic' },
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/packages',
    loadComponent: () => import('./features/products/admin/packages/admin-package-editor/admin-package-editor.component').then(m => m.AdminPackageEditorComponent),
    title: 'Paquetes | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/packages/new',
    loadComponent: () => import('./features/products/admin/packages/admin-package-editor/admin-package-editor.component').then(m => m.AdminPackageEditorComponent),
    title: 'Nuevo Paquete | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/packages/:id/edit',
    loadComponent: () => import('./features/products/admin/packages/admin-package-editor/admin-package-editor.component').then(m => m.AdminPackageEditorComponent),
    title: 'Editar Paquete | Admin',
    data: { renderMode: 'dynamic' },
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/offers',
    loadComponent: () => import('./features/products/admin/offers/admin-offers-manager/admin-offers-manager.component').then(m => m.AdminOffersManagerComponent),
    title: 'Ofertas | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/categories',
    loadComponent: () => import('./features/products/admin/categories/admin-category-hierarchy-manager/admin-category-hierarchy-manager.component').then(m => m.AdminCategoryHierarchyManagerComponent),
    title: 'Categorías | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/assemblies',
    loadComponent: () => import('./features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component').then(m => m.AdminAssemblyEditorComponent),
    title: 'Ensambles | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/assemblies/new',
    loadComponent: () => import('./features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component').then(m => m.AdminAssemblyEditorComponent),
    title: 'Nuevo Ensamble | Admin',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/products/assemblies/:id/edit',
    loadComponent: () => import('./features/products/admin/assemblies/admin-assembly-editor/admin-assembly-editor.component').then(m => m.AdminAssemblyEditorComponent),
    title: 'Editar Ensamble | Admin',
    data: { renderMode: 'dynamic' },
    canActivate: [AuthGuard]
  },

  // Ruta fallback
  {
    path: '**',
    redirectTo: ''
  }
];
