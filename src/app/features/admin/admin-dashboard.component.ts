import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from './admin-header.component';
import { BlogService } from '../blog/services/blog.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>
    <div class="min-h-screen p-6 bg-[#071029] text-white">
      <div class="max-w-6xl mx-auto">
        <!-- Selector de Módulos Admin -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold mb-6">Panel Administrativo</h1>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Admin Blog -->
            <div class="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-2 border-cyan-400/50 rounded-lg p-6 hover:border-cyan-400 transition cursor-pointer"
              (click)="currentModule = 'blog'"
              [class.ring-2]="currentModule === 'blog'"
              [class.ring-cyan-400]="currentModule === 'blog'"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-cyan-400 mb-2">
                    <i class="fas fa-newspaper mr-2"></i>Admin Blog
                  </h2>
                  <p class="text-gray-300 text-sm">Gestiona artículos, categorías y contenido</p>
                </div>
                <i class="fas fa-check-circle text-2xl text-cyan-400 opacity-0" [class.opacity-100]="currentModule === 'blog'"></i>
              </div>
              <button routerLink="/admin/blog" class="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded transition">
                Ir a Admin Blog <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>

            <!-- Admin Productos -->
            <div class="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-2 border-pink-400/50 rounded-lg p-6 hover:border-pink-400 transition cursor-pointer"
              (click)="currentModule = 'products'"
              [class.ring-2]="currentModule === 'products'"
              [class.ring-pink-400]="currentModule === 'products'"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-pink-400 mb-2">
                    <i class="fas fa-box mr-2"></i>Admin Productos
                  </h2>
                  <p class="text-gray-300 text-sm">Gestiona productos, paquetes y ofertas</p>
                </div>
                <i class="fas fa-check-circle text-2xl text-pink-400 opacity-0" [class.opacity-100]="currentModule === 'products'"></i>
              </div>
              <button routerLink="/admin/products" class="mt-4 w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded transition">
                Ir a Admin Productos <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>

            <!-- Admin Comunidad -->
            <div class="bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border-2 border-violet-400/50 rounded-lg p-6 hover:border-cyan-400 transition cursor-pointer"
              (click)="currentModule = 'community'"
              [class.ring-2]="currentModule === 'community'"
              [class.ring-violet-400]="currentModule === 'community'"
            >
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h2 class="text-2xl font-bold text-violet-300 mb-2">
                    <i class="fas fa-users mr-2"></i>Admin Comunidad
                  </h2>
                  <p class="text-gray-300 text-sm">Gestiona colaboradores, fotos y textos de la pagina</p>
                </div>
                <i class="fas fa-check-circle text-2xl text-violet-300 opacity-0" [class.opacity-100]="currentModule === 'community'"></i>
              </div>
              <button routerLink="/admin/community" class="mt-4 w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-2 px-4 rounded transition">
                Ir a Admin Comunidad <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Contenido del módulo actual (Blog) -->
        <div *ngIf="currentModule === 'blog'">
          <h2 class="text-3xl font-bold mb-6 border-t border-white/20 pt-6">Administración de Blog</h2>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="p-4 bg-[#081229] rounded border border-white/5">
              <div class="text-sm text-gray-300">Artículos totales</div>
              <div class="text-2xl font-bold">{{ totalArticles }}</div>
            </div>

            <div class="p-4 bg-[#081229] rounded border border-white/5">
              <div class="text-sm text-gray-300">Categorías</div>
              <div class="text-2xl font-bold">{{ totalCategories }}</div>
            </div>

            <div class="p-4 bg-[#081229] rounded border border-white/5">
              <div class="text-sm text-gray-300">Artículos publicados</div>
              <div class="text-2xl font-bold">{{ publishedCount }}</div>
            </div>

            <div class="p-4 bg-[#081229] rounded border border-white/5">
              <div class="text-sm text-gray-300">Borradores</div>
              <div class="text-2xl font-bold">{{ draftCount }}</div>
            </div>
          </div>

          <div class="mb-6 flex gap-3">
            <a routerLink="/admin/blog" class="px-4 py-2 bg-cyan-400 text-[#071029] rounded font-semibold">Ver Artículos</a>
            <a routerLink="/admin/blog/new" class="px-4 py-2 bg-yellow-400 text-[#071029] rounded font-semibold">Crear Artículo</a>
            <a routerLink="/admin/blog/categories" class="px-4 py-2 bg-purple-500 text-white rounded font-semibold">Gestionar Categorías</a>
          </div>

          <div class="p-4 bg-[#081229] rounded border border-white/5">
            <h3 class="text-xl font-semibold mb-3">Últimos artículos</h3>
            <ul>
              <li *ngFor="let a of recentArticles" class="py-2 border-t border-white/5 flex justify-between items-center">
                <div>
                  <div class="font-semibold">{{ a.title }}</div>
                  <div class="text-xs text-gray-400">{{ a.publishedAt | date:'medium' }}</div>
                </div>
                <div class="flex gap-2">
                  <a [routerLink]="['/admin/blog', a._id, 'edit']" class="px-3 py-1 bg-yellow-400 rounded text-[#071029]">Editar</a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div *ngIf="currentModule === 'community'">
          <h2 class="text-3xl font-bold mb-6 border-t border-white/20 pt-6">Administracion de Comunidad</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <a routerLink="/admin/community" class="rounded-lg border border-violet-400/40 bg-[#081229] p-5 transition hover:border-cyan-300">
              <i class="fas fa-id-card text-2xl text-violet-300"></i>
              <h3 class="mt-4 text-xl font-bold">Gestionar colaboradores</h3>
              <p class="mt-2 text-sm text-gray-300">Agregar, editar, publicar y ordenar perfiles de colaboradores e influencers.</p>
            </a>
            <a routerLink="/colaboradores" class="rounded-lg border border-cyan-400/40 bg-[#081229] p-5 transition hover:border-pink-300">
              <i class="fas fa-external-link-alt text-2xl text-cyan-300"></i>
              <h3 class="mt-4 text-xl font-bold">Ver pagina publica</h3>
              <p class="mt-2 text-sm text-gray-300">Revisar como se ve la comunidad para usuarios finales.</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  totalArticles = 0;
  totalCategories = 0;
  publishedCount = 0;
  draftCount = 0;
  recentArticles: any[] = [];

  currentModule: 'blog' | 'products' | 'community' = 'blog';

  constructor(private blog: BlogService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // get categories
    this.blog.getCategories().subscribe((cats: any) => {
      const list = Array.isArray(cats) ? cats : (cats.data || cats);
      this.totalCategories = list.length;
    }, () => this.totalCategories = 0);

    // get recent articles and counts
    this.blog.list({ page: 0, limit: 1000 }).subscribe((res: any) => {
      const all = Array.isArray(res) ? res : (res.data || []);
      this.totalArticles = (res && res.total) ? res.total : all.length;
      this.publishedCount = all.filter((x: any) => x.published).length;
      this.draftCount = all.filter((x: any) => !x.published).length;
      this.recentArticles = all.slice(0, 5);
    }, () => {
      this.totalArticles = 0;
      this.publishedCount = 0;
      this.draftCount = 0;
      this.recentArticles = [];
    });
  }
}
