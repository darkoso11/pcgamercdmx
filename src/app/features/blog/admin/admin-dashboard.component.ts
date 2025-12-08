import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from './admin-header.component';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>
    <div class="min-h-screen p-6 bg-[#071029] text-white">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-3xl font-bold mb-6">Dashboard — Admin</h2>

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
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  totalArticles = 0;
  totalCategories = 0;
  publishedCount = 0;
  draftCount = 0;
  recentArticles: any[] = [];

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
