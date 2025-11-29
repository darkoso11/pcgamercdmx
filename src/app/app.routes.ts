import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

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
    path: 'blog',
    loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent)
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

  // Rutas con parámetros - usar renderMode: 'dynamic'
/*   {
    path: 'productos/:slug',
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent),
    title: 'Productos | PC Gamer CDMX',
    // Importante: Especificar modo de renderizado dinámico para evitar el error
    data: {
      renderMode: 'dynamic' 
    }
  }, */
/*   {
    path: 'categorias/:tag',
    loadComponent: () => import('./features/products/category.component').then(m => m.CategoryComponent),
    data: {
      renderMode: 'dynamic'
    }
  }, */
  // Importante: Especificar modo de renderizado dinámico para evitar el error
/*   {
    path: 'blog/:slug',
    loadComponent: () => import('./features/blog/blog.component').then(m => m.BlogComponent),
    title: 'Blog | PC Gamer CDMX',
    data: {
      renderMode: 'dynamic'
    }
  }, */

  // Ruta fallback
  {
    path: '**',
    redirectTo: ''
  }
];
