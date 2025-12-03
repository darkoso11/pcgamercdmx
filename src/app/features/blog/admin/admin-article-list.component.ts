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
    <div class="min-h-screen bg-[#071029] p-6">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl font-bold text-cyan-400 mb-6">Artículos</h2>
        
        <div class="bg-[#0b1220] border border-cyan-400/30 p-6 rounded-lg mb-6">
          <p class="text-gray-400 mb-4">Aquí irá la lista de artículos con paginación, búsqueda y acciones (editar, publicar, duplicar, borrar).</p>
          <a routerLink="/admin/blog/new" class="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded font-semibold transition">
            + Crear Nuevo Artículo
          </a>
        </div>
      </div>
    </div>
  `
})
export class AdminArticleListComponent {}
