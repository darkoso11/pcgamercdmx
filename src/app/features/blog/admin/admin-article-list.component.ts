import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>
    <div class="p-6">
      <h2 class="text-xl font-bold mb-4">Blog Admin — Artículos</h2>
      <p>Placeholder: aquí irá la lista de artículos con paginación y acciones (editar, publicar, borrar).</p>
      <a routerLink="/admin/blog/new" class="text-sm text-blue-400">Crear nuevo artículo</a>
    </div>
  `
})
export class AdminArticleListComponent {}
