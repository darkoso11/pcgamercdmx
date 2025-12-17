import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeaderComponent } from './admin-header.component';
import { BlogService } from '../services/blog.service';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>
    <div class="min-h-screen bg-[#071029] p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-cyan-400">Artículos</h2>
          <a routerLink="/admin/blog/new" class="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded font-semibold transition">+ Nuevo</a>
        </div>

        <div class="bg-[#0b1220] border border-cyan-400/30 p-4 rounded-lg mb-6">
          <div class="flex gap-3 mb-4">
            <input [(ngModel)]="q" (ngModelChange)="load()" placeholder="Buscar por título o tag" class="flex-1 p-2 rounded bg-[#081229] border border-cyan-400/20 text-white" />
            <select [(ngModel)]="filterCategory" (change)="onCategoryChange(); load()" class="p-2 rounded bg-[#081229] border border-cyan-400/20 text-white">
              <option value="">Todas las categorías</option>
              <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
            </select>
            <select [(ngModel)]="filterSubcategory" (change)="load()" class="p-2 rounded bg-[#081229] border border-cyan-400/20 text-white">
              <option value="">Todas las subcategorías</option>
              <option *ngFor="let sub of filteredSubcategories" [value]="sub._id">{{ sub.name }}</option>
            </select>
            <button (click)="load()" class="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded">Buscar</button>
          </div>

          <table class="w-full text-left text-sm">
            <thead>
              <tr class="text-gray-400 border-b border-white/5">
                <th class="py-2">Título</th>
                <th class="py-2">Categoría</th>
                <th class="py-2">Subcategoría</th>
                <th class="py-2">Publicado</th>
                <th class="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let a of articles" class="border-b border-white/5 hover:bg-white/2">
                <td class="py-3">{{ a.title }}</td>
                <td class="py-3">{{ getCategoryName(a.categoryId) }}</td>
                <td class="py-3">{{ a.subCategoryId ? getSubcategoryName(a.subCategoryId) : '-' }}</td>
                <td class="py-3">{{ a.published ? 'Sí' : 'No' }}</td>
                <td class="py-3">
                  <a [routerLink]="['/admin/blog', a._id, 'edit']" class="text-cyan-300 mr-3">Editar</a>
                  <button (click)="deleteArticle(a._id)" class="text-red-400">Borrar</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="articles.length === 0" class="text-center text-gray-400 p-6">No se encontraron artículos</div>
        </div>
      </div>
    </div>
  `
})
export class AdminArticleListComponent {
  articles: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  filteredSubcategories: any[] = [];
  q = '';
  filterCategory = '';
  filterSubcategory = '';

  constructor(private blog: BlogService) {}

  ngOnInit() {
    this.loadCategories();
    this.loadSubcategories();
    this.load();
  }

  loadCategories() {
    this.blog.getCategories().subscribe((res: any) => {
      this.categories = Array.isArray(res) ? res : (res.data || res);
    });
  }

  loadSubcategories() {
    this.blog.getSubCategories().subscribe((res: any) => {
      this.subcategories = Array.isArray(res) ? res : (res.data || res);
      this.updateFilteredSubcategories();
    });
  }

  onCategoryChange() {
    this.updateFilteredSubcategories();
    this.filterSubcategory = ''; // Reset subcategory filter
  }

  updateFilteredSubcategories() {
    this.filteredSubcategories = this.filterCategory ? this.subcategories.filter(s => s.categoryId === this.filterCategory) : this.subcategories;
  }

  getCategoryName(id: string): string {
    const cat = this.categories.find(c => c._id === id);
    return cat ? cat.name : id;
  }

  getSubcategoryName(id: string): string {
    const sub = this.subcategories.find(s => s._id === id);
    return sub ? sub.name : id;
  }

  load() {
    const params: any = { q: this.q };
    if (this.filterCategory) params.categoryId = this.filterCategory;
    if (this.filterSubcategory) params.subCategoryId = this.filterSubcategory;
    this.blog.list(params).subscribe({ next: (res: any) => this.articles = res?.data || res || [], error: () => this.articles = [] });
  }

  deleteArticle(id?: string) {
    if (!id) return;
    if (!confirm('¿Eliminar este artículo?')) return;
    this.blog.delete(id).subscribe({ next: () => this.load() });
  }
}
