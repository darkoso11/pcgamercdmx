import { Subscription } from 'rxjs';
import { adminBlogDateRange } from '../services/blog-admin-filters.utils';
import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminHeaderComponent } from '../../admin/admin-header.component';
import { BlogService } from '../services/blog.service';
import { adminUrl } from '../../admin/admin-route.config';
import { getPublicationState } from '../services/blog-content.utils';

@Component({
  selector: 'app-admin-article-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>
    <div class="min-h-screen bg-[#071029] p-6 text-slate-100">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-3xl font-bold text-cyan-400">Artículos</h2>
          <a [routerLink]="adminNewArticleUrl" class="inline-block bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded font-semibold transition">+ Nuevo</a>
        </div>

        <div class="bg-[#0b1220] border border-cyan-300/40 p-4 rounded-lg mb-6 overflow-x-auto">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label for="blog-filter-title" class="block text-sm text-gray-400 mb-1">Buscar por título</label>
              <input id="blog-filter-title" [(ngModel)]="q" (ngModelChange)="queueSearch()" (keydown.enter)="onSearch()" placeholder="Buscar por título..." class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white" />
            </div>
            <div>
              <label for="blog-filter-tags" class="block text-sm text-gray-400 mb-1">Buscar por tags</label>
              <input id="blog-filter-tags" [(ngModel)]="filterTags" (ngModelChange)="queueSearch()" (keydown.enter)="onSearch()" placeholder="Ej: Intel, CPU, Gaming" class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white" />
            </div>
            <div>
              <label for="blog-filter-state" class="block text-sm text-gray-400 mb-1">Estado</label>
              <select id="blog-filter-state" [(ngModel)]="filterPublished" (ngModelChange)="onSearch()" class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white">
                <option value="">Todos</option>
                <option value="true">Publicado</option>
                <option value="false">Borrador</option>
                <option value="scheduled">Programado</option>
              </select>
            </div>
            <div>
              <label for="blog-filter-category" class="block text-sm text-gray-400 mb-1">Categoría</label>
              <select id="blog-filter-category" [(ngModel)]="filterCategory" (ngModelChange)="onCategoryChange(); onSearch()" class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white">
                <option value="">Todas las categorías</option>
                <option *ngFor="let cat of categories" [value]="cat._id">{{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label for="blog-filter-subcategory" class="block text-sm text-gray-400 mb-1">Subcategoría</label>
              <select id="blog-filter-subcategory" [(ngModel)]="filterSubcategory" (ngModelChange)="onSearch()" class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white">
                <option value="">Todas las subcategorías</option>
                <option *ngFor="let sub of filteredSubcategories" [value]="sub._id">{{ sub.name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label for="blog-filter-from" class="block text-sm text-gray-400 mb-1">Fecha desde</label>
                <input id="blog-filter-from" [(ngModel)]="filterDateFrom" (ngModelChange)="queueSearch()" type="date" class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white" />
              </div>
              <div>
                <label for="blog-filter-to" class="block text-sm text-gray-400 mb-1">Fecha hasta</label>
                <input id="blog-filter-to" [(ngModel)]="filterDateTo" (ngModelChange)="queueSearch()" type="date" class="w-full p-2 rounded bg-[#081229] border border-cyan-400/20 text-white" />
              </div>
            </div>
          </div>
          <div class="flex gap-2">
            <button (click)="clearFilters()" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
              Limpiar Filtros
            </button>
            <button (click)="onSearch()" [disabled]="loading" class="bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-800 text-white px-4 py-2 rounded">
              {{ loading ? 'Buscando...' : 'Buscar' }}
            </button>
          </div>

          <p class="mt-3 text-sm text-slate-300">Los filtros se aplican al cambiar. Las etiquetas separadas por comas coinciden con cualquiera de ellas. El rango incluye ambos días en horario de Ciudad de México y usa la fecha mostrada en la tabla (creación o publicación en registros antiguos); las entradas sin fecha quedan fuera del rango.</p>
          <p *ngIf="error" role="alert" class="my-4 text-amber-200">{{ error }}</p>
          <table class="w-full min-w-[760px] text-left text-sm text-slate-100">
            <thead>
              <tr class="text-gray-400 border-b border-white/5">
                <th class="py-2">Título</th>
                <th class="py-2">Categoría</th>
                <th class="py-2">Subcategoría</th>
                <th class="py-2">Fecha</th>
                <th class="py-2">Estado</th>
                <th class="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody *ngIf="!loading">
              <tr *ngFor="let a of articles" class="border-b border-white/5 hover:bg-white/2">
                <td class="py-3">{{ a.title }}</td>
                <td class="py-3">{{ getCategoryName(a.categoryId) }}</td>
                <td class="py-3">{{ a.subCategoryId ? getSubcategoryName(a.subCategoryId) : '-' }}</td>
                <td class="py-3">{{ formatDate(a.createdAt) }}</td>
                <td class="py-3">
                  <span class="inline-flex rounded-full px-2 py-1 text-xs font-bold"
                    [class]="publicationLabel(a) === 'Programado' ? 'bg-amber-900 text-amber-100' : publicationLabel(a) === 'Publicado' ? 'bg-emerald-900 text-emerald-100' : 'bg-slate-700 text-slate-100'">
                    {{ publicationLabel(a) }}
                  </span>
                </td>
                <td class="py-3">
                  <a [routerLink]="[adminBlogUrl, a._id, 'edit']" class="text-cyan-300 mr-3">Editar</a>
                  <button (click)="deleteArticle(a._id)" class="text-red-400">Borrar</button>
                </td>
              </tr>
            </tbody>
            <tbody *ngIf="loading">
              <tr>
                <td colspan="6" class="text-center py-8">
                  <div class="inline-flex items-center text-cyan-400">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400 mr-2"></div>
                    Cargando artículos...
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="articles.length === 0 && !loading && !error" class="text-center text-gray-400 p-6">
            {{ q || filterCategory || filterSubcategory || filterPublished || filterDateFrom || filterDateTo || filterTags ? 'No se encontraron artículos con los filtros aplicados' : 'No hay artículos aún' }}
          </div>

          <!-- Pagination Controls -->
          <div *ngIf="totalPages > 1" class="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <div class="text-sm text-gray-400">
              Mostrando {{ (currentPage * pageSize) + 1 }}-{{ getEndIndex() }} de {{ totalArticles }} artículos
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="prevPage()"
                [disabled]="currentPage === 0 || loading"
                class="px-3 py-1 rounded bg-[#081229] border border-cyan-400/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400/10">
                ← Anterior
              </button>

              <div class="flex gap-1">
                <button
                  *ngFor="let page of getPagesArray()"
                  (click)="goToPage(page)"
                  [disabled]="loading"
                  [class.active]="page === currentPage"
                  class="px-3 py-1 rounded border text-sm transition-colors"
                  [class]="page === currentPage ? 'bg-cyan-400 text-[#071029] border-cyan-400' : 'bg-[#081229] border-cyan-400/20 text-white hover:bg-cyan-400/10'">
                  {{ page + 1 }}
                </button>
              </div>

              <button
                (click)="nextPage()"
                [disabled]="currentPage >= totalPages - 1 || loading"
                class="px-3 py-1 rounded bg-[#081229] border border-cyan-400/20 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cyan-400/10">
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminArticleListComponent implements OnDestroy {
  readonly adminBlogUrl = adminUrl('blog');
  readonly adminNewArticleUrl = adminUrl('blog/new');
  articles: any[] = [];
  categories: any[] = [];
  subcategories: any[] = [];
  filteredSubcategories: any[] = [];
  q = '';
  filterCategory = '';
  filterSubcategory = '';
  filterPublished = '';
  filterDateFrom = '';
  filterDateTo = '';
  filterTags = '';

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalArticles = 0;
  totalPages = 0;
  loading = false;
  error = '';
  private searchRequest?: Subscription;
  private searchTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private blog: BlogService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.loadSubcategories();
    this.load();
  }

  loadCategories() {
    this.blog.getCategories().subscribe((res: any) => {
      this.categories = Array.isArray(res) ? res : (res.data || res);
      this.cdr.detectChanges();
    });
  }

  loadSubcategories() {
    this.blog.getSubCategories().subscribe((res: any) => {
      this.subcategories = Array.isArray(res) ? res : (res.data || res);
      this.updateFilteredSubcategories();
      this.cdr.detectChanges();
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

  formatDate(dateString: string): string {
    if (!dateString || !Number.isFinite(Date.parse(dateString))) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  publicationLabel(article: any): string {
    const state = getPublicationState(article.published, article.publishedAt);
    return state === 'scheduled' ? 'Programado' : state === 'published' ? 'Publicado' : 'Borrador';
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchTimer);
    this.searchRequest?.unsubscribe();
  }

  queueSearch(): void {
    clearTimeout(this.searchTimer);
    this.searchRequest?.unsubscribe();
    this.loading = true;
    this.searchTimer = setTimeout(() => this.onSearch(), 300);
  }

  load() {
    this.searchRequest?.unsubscribe();
    this.error = '';
    try { adminBlogDateRange(this.filterDateFrom, this.filterDateTo); }
    catch (error) {
      this.error = (error as Error).message;
      this.articles = [];
      this.totalArticles = this.totalPages = 0;
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    this.loading = true;
    const params: any = {
      q: this.q,
      page: this.currentPage,
      limit: this.pageSize
    };
    if (this.filterCategory) params.categoryId = this.filterCategory;
    if (this.filterSubcategory) params.subCategoryId = this.filterSubcategory;
    if (this.filterPublished !== '') params.status = this.filterPublished === 'true' ? 'published' : this.filterPublished === 'false' ? 'draft' : 'scheduled';
    if (this.filterDateFrom) params.dateFrom = this.filterDateFrom;
    if (this.filterDateTo) params.dateTo = this.filterDateTo;
    if (this.filterTags) params.tags = this.filterTags;

    this.searchRequest = this.blog.list(params).subscribe({
      next: (res: any) => {
        this.articles = res?.data || res || [];
        this.totalArticles = res?.total || 0;
        this.totalPages = Math.ceil(this.totalArticles / this.pageSize);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los artículos. Revisa la conexión o tus permisos y vuelve a buscar.';
        this.articles = [];
        this.totalArticles = 0;
        this.totalPages = 0;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.currentPage = 0; // Reset to first page when searching
    this.load();
  }

  clearFilters() {
    this.q = '';
    this.filterCategory = '';
    this.filterSubcategory = '';
    this.filterPublished = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.filterTags = '';
    this.onCategoryChange();
    this.onSearch();
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.load();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.load();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.load();
    }
  }

  getPagesArray(): number[] {
    const pages = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 3);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalArticles);
  }

  deleteArticle(id?: string) {
    if (!id) return;
    if (!confirm('¿Eliminar este artículo?')) return;
    this.loading = true;
    this.blog.delete(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.loading = false;
        alert('Error al eliminar el artículo');
      }
    });
  }
}
