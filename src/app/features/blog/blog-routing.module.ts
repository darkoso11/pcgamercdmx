import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogHomeComponent } from './pages/blog-home/blog-home.component';
import { BlogPostComponent } from './pages/blog-post/blog-post.component';

const routes: Routes = [
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
