import { Routes } from '@angular/router';
import { AuthGuard } from './features/admin/services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'PC Gamer CDMX | Ensambles y computadoras gamer en CDMX',
    data: {
      description: 'Compra o cotiza tu PC gamer en CDMX: ensambles personalizados, paquetes listos, perifericos, componentes y soporte tecnico especializado.',
      keywords: 'pc gamer cdmx, ensambles pc gamer, computadoras gamer cdmx, cotizar pc gamer, perifericos gamer',
      image: '/assets/img/leon.png'
    }
  },
  {
    path: 'ensambles',
    loadComponent: () => import('./features/assemblies/assemblies.component').then(m => m.AssembliesComponent),
    title: 'Ensambles | PC Gamer CDMX',
    data: {
      description: 'Explora ensambles de PC listos para gaming, streaming y trabajo creativo en PC Gamer CDMX.',
      keywords: 'ensambles pc gamer, pc prearmada, pc gaming mexico, pc gamer cdmx'
    }
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
  {
    path: 'colaboradores',
    loadComponent: () => import('./features/community/community.component').then(m => m.CommunityComponent),
    title: 'Colaboradores | PC Gamer CDMX',
    data: { description: 'Conoce a los colaboradores e influencers de la comunidad PC Gamer CDMX.' }
  },
  {
    path: 'colaboradores/:slug',
    loadComponent: () => import('./features/community/community-detail.component').then(m => m.CommunityDetailComponent),
    title: 'Perfil de colaborador | PC Gamer CDMX',
    data: { renderMode: 'dynamic' }
  },
  
  // Rutas adicionales
  {
    path: 'productos',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    title: 'Productos | PC Gamer CDMX',
    data: {
      description: 'Catalogo de componentes, perifericos, paquetes y productos gamer disponibles en PC Gamer CDMX.',
      keywords: 'componentes pc, perifericos gamer, productos gamer, pc gamer cdmx'
    },
    children: [
      {
        path: 'perifericos',
        loadComponent: () => import('./features/products/peripherals/peripherals').then(m => m.Peripherals),
        title: 'Perifericos gamer | PC Gamer CDMX',
        data: {
          description: 'Explora perifericos gamer: teclados, mouse, monitores, headsets, sillas y accesorios para completar tu setup.',
          keywords: 'perifericos gamer, teclados gamer, mouse gamer, monitores gamer, headsets gamer'
        }
      },
      {
        path: 'hardware-accesorios',
        loadComponent: () => import('./features/products/components/components').then(m => m.Components),
        title: 'Hardware y accesorios para PC | PC Gamer CDMX',
        data: {
          description: 'Hardware, componentes, cables, adaptadores y accesorios para armar, actualizar o conectar tu PC.',
          keywords: 'hardware pc, accesorios pc, cables pc, adaptadores pc, componentes pc, tarjeta grafica, procesador'
        }
      },
      {
        path: 'componentes',
        redirectTo: 'hardware-accesorios',
        pathMatch: 'full'
      },
      {
        path: ':slug',
        loadComponent: () => import('./features/products/product-detail.component').then(m => m.ProductDetailComponent),
        data: { seoType: 'product' }
      },
      {
        path: '',
        redirectTo: 'perifericos',
        pathMatch: 'full'
      }
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
    loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
    title: 'Galeria | PC Gamer CDMX',
    data: { description: 'Galeria de ensambles, gabinetes personalizados y setups creados por PC Gamer CDMX.' }
  },
  {
    path: 'sorteos',
    loadComponent: () => import('./features/giveaways/giveaways.component').then(m => m.GiveawaysComponent),
    title: 'Sorteos | PC Gamer CDMX',
    data: { description: 'Sorteos, dinamicas y eventos de la comunidad PC Gamer CDMX.' }
  },
  {
    path: 'servicios',
    loadComponent: () => import('./features/services/services.component').then(m => m.ServicesComponent),
    title: 'Servicios tecnicos | PC Gamer CDMX',
    data: { description: 'Servicio tecnico para PCs gamer: mantenimiento, actualizaciones, diagnostico, reparacion y ensamble.' }
  },
  {
    path: 'cotiza-tu-pc',
    loadComponent: () => import('./features/quotation/quotation.component').then(m => m.QuotationComponent),
    title: 'Cotiza tu PC | PC Gamer CDMX',
    data: { description: 'Cotiza una PC gamer personalizada con componentes seleccionados para tu presupuesto, juegos y flujo de trabajo.' }
  },
  {
    path: 'politica-privacidad',
    loadComponent: () => import('./features/legal/legal-page.component').then(m => m.LegalPageComponent),
    title: 'Política de Privacidad | PC Gamer CDMX',
    data: { page: 'privacidad' }
  },
  {
    path: 'terminos',
    loadComponent: () => import('./features/legal/legal-page.component').then(m => m.LegalPageComponent),
    title: 'Términos y Condiciones | PC Gamer CDMX',
    data: { page: 'terminos' }
  },

  // Blog routes
  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog-list.component').then(m => m.BlogListComponent),
    title: 'Blog | PC Gamer CDMX',
    data: { description: 'Guias, noticias y consejos de hardware, gaming, streaming y ensamble de PCs en el blog de PC Gamer CDMX.' }
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
    data: { noIndex: true },
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
  {
    path: 'admin/community',
    loadComponent: () => import('./features/community/admin-community.component').then(m => m.AdminCommunityComponent),
    title: 'Admin Comunidad | PC Gamer CDMX',
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/home',
    loadComponent: () => import('./features/home/admin-home-content.component').then(m => m.AdminHomeContentComponent),
    title: 'Admin Home | PC Gamer CDMX',
    canActivate: [AuthGuard]
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
    loadComponent: () => import('./features/products/admin/assemblies/admin-assemblies-list/admin-assemblies-list.component').then(m => m.AdminAssembliesListComponent),
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
