import { Routes } from '@angular/router';
import { BlogHomeComponent } from './pages/blog-home/blog-home.component';
import { BlogPostComponent } from './pages/blog-post/blog-post.component';

export const BLOG_ROUTES: Routes = [
  {
    path: '',
    component: BlogHomeComponent
  },
  {
    path: 'categoria/:category',
    component: BlogHomeComponent
  },
  {
    path: 'tag/:tag',
    component: BlogHomeComponent
  },
  {
    path: ':slug',
    component: BlogPostComponent
  }
];
