import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Article, Category } from './models/types';
import { BlogService } from './services/blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="blog-page">
      <header class="blog-hero">
        <div class="hero-inner">
          <p class="eyebrow">PC Gamer CDMX · Guías de campo</p>
          <h1>Arma mejor.<br /><span>Juega más.</span></h1>
          <p class="hero-copy">
            Decisiones claras sobre hardware, rendimiento y cultura PC, explicadas por
            personas que construyen equipos todos los días.
          </p>
        </div>
      </header>

      <section class="blog-content" aria-labelledby="latest-heading">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Biblioteca editorial</p>
            <h2 id="latest-heading">Últimas publicaciones</h2>
          </div>
          <p>{{ total }} {{ total === 1 ? 'entrada' : 'entradas' }}</p>
        </div>

        <form class="filters" (ngSubmit)="search()" role="search">
          <label>
            <span>Buscar artículos</span>
            <input
              name="query"
              [(ngModel)]="query"
              type="search"
              placeholder="Ej. ventiladores, Intel, gabinete"
            />
          </label>
          <label>
            <span>Categoría</span>
            <select name="category" [(ngModel)]="categoryId">
              <option value="">Todas las categorías</option>
              <option *ngFor="let category of categories" [value]="category._id">
                {{ category.name }}
              </option>
            </select>
          </label>
          <button type="submit">Buscar</button>
        </form>

        <div class="status" aria-live="polite">
          <div *ngIf="loading" class="loading">
            <span class="spinner" aria-hidden="true"></span>
            Cargando publicaciones…
          </div>
          <div *ngIf="error" class="error-state" role="alert">
            <strong>No pudimos cargar el blog.</strong>
            <span>Revisa tu conexión e inténtalo de nuevo.</span>
            <button type="button" (click)="load(true)">Reintentar</button>
          </div>
          <div *ngIf="!loading && !error && !articles.length" class="empty-state">
            <strong>No encontramos publicaciones.</strong>
            <span>Prueba con otro término o categoría.</span>
          </div>
        </div>

        <div *ngIf="!loading && !error && articles.length" class="article-grid">
          <article *ngFor="let article of articles; trackBy: trackBySlug">
            <a [routerLink]="['/blog', article.slug]" class="article-link">
              <div class="cover">
                <img
                  *ngIf="article.coverImage?.url; else coverFallback"
                  [src]="article.coverImage?.url"
                  [alt]="article.coverImage?.alt || ''"
                  loading="lazy"
                />
                <ng-template #coverFallback>
                  <div class="cover-fallback" aria-hidden="true">
                    <span>PCG</span>
                  </div>
                </ng-template>
              </div>
              <div class="article-meta">
                <time [attr.datetime]="article.publishedAt">
                  {{ formatPublishedAt(article.publishedAt) }}
                </time>
                <span *ngIf="article.tags?.length">{{ article.tags?.[0] }}</span>
              </div>
              <h3>{{ article.title }}</h3>
              <p>{{ article.summary }}</p>
              <span class="read-more">Leer artículo <span aria-hidden="true">→</span></span>
            </a>
          </article>
        </div>

        <div class="load-more" *ngIf="!loading && !error && hasMore">
          <button type="button" (click)="loadMore()">Cargar más publicaciones</button>
        </div>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; background: #07111f; color: #f8fafc; }
    .blog-page { min-height: 100vh; }
    .blog-hero { min-height: 520px; display: grid; align-items: end; padding: 7rem 1.5rem 4.5rem;
      background: linear-gradient(90deg, rgba(4,14,28,.97) 0%, rgba(4,14,28,.78) 52%, rgba(4,14,28,.28) 100%),
        radial-gradient(circle at 82% 22%, rgba(34,211,238,.36), transparent 30%),
        linear-gradient(135deg, #0f766e, #07111f 62%); }
    .hero-inner, .blog-content { width: min(1180px, 100%); margin: 0 auto; }
    .hero-inner { animation: reveal .55s ease-out both; }
    .eyebrow { margin: 0 0 .85rem; color: #67e8f9; font-size: .76rem; font-weight: 800;
      letter-spacing: .16em; text-transform: uppercase; }
    h1 { margin: 0; max-width: 780px; font-size: clamp(3.25rem, 8vw, 7rem); line-height: .88;
      letter-spacing: -.065em; color: #fff; }
    h1 span { color: #67e8f9; }
    .hero-copy { max-width: 620px; margin: 1.75rem 0 0; color: #d7e2ef; font-size: 1.1rem; line-height: 1.7; }
    .blog-content { padding: 5rem 1.5rem 6rem; }
    .section-heading { display: flex; align-items: end; justify-content: space-between; gap: 2rem;
      padding-bottom: 1.5rem; border-bottom: 1px solid #263a55; }
    .section-heading h2 { margin: 0; font-size: clamp(2rem, 4vw, 3.25rem); letter-spacing: -.035em; color: #fff; }
    .section-heading > p { margin: 0; color: #a9bbcf; }
    .filters { display: grid; grid-template-columns: minmax(240px, 1fr) minmax(210px, .45fr) auto;
      gap: 1rem; align-items: end; padding: 1.75rem 0 2.5rem; }
    label span { display: block; margin-bottom: .55rem; color: #cbd5e1; font-size: .82rem; font-weight: 700; }
    input, select { width: 100%; min-height: 48px; padding: 0 .9rem; border: 1px solid #47627f; border-radius: 8px;
      background: #0b1a2d; color: #f8fafc; font: inherit; }
    input::placeholder { color: #91a3b8; }
    button { min-height: 48px; padding: 0 1.25rem; border: 1px solid transparent; border-radius: 8px;
      background: #22d3ee; color: #05242c; font: inherit; font-weight: 850; cursor: pointer; }
    input:focus-visible, select:focus-visible, button:focus-visible, .article-link:focus-visible {
      outline: 3px solid #f8fafc; outline-offset: 3px; }
    .article-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: 1.4rem; row-gap: 3.5rem; }
    article { min-width: 0; }
    .article-link { display: block; color: inherit; text-decoration: none; }
    .cover { aspect-ratio: 16 / 10; overflow: hidden; border-radius: 12px; background: #0b1a2d; }
    .cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .28s ease; }
    .article-link:hover .cover img { transform: scale(1.035); }
    .cover-fallback { width: 100%; height: 100%; display: grid; place-items: center;
      background: radial-gradient(circle at 70% 30%, rgba(34,211,238,.28), transparent 30%), #0b1a2d; }
    .cover-fallback span { color: #67e8f9; font-size: 2rem; font-weight: 900; letter-spacing: .08em; }
    .article-meta { display: flex; justify-content: space-between; gap: .75rem; margin-top: 1rem;
      color: #8ee9f5; font-size: .75rem; font-weight: 750; text-transform: uppercase; letter-spacing: .07em; }
    article h3 { margin: .75rem 0 0; color: #fff; font-size: 1.45rem; line-height: 1.2; letter-spacing: -.02em; }
    article p { margin: .8rem 0 0; color: #b9c7d8; line-height: 1.65; }
    .read-more { display: inline-block; margin-top: 1rem; color: #67e8f9; font-weight: 800; }
    .status:empty { display: none; }
    .loading, .error-state, .empty-state { min-height: 180px; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: .6rem; color: #cbd5e1; text-align: center; }
    .spinner { width: 26px; height: 26px; border: 3px solid #47627f; border-top-color: #67e8f9;
      border-radius: 50%; animation: spin .8s linear infinite; }
    .error-state strong, .empty-state strong { color: #fff; font-size: 1.2rem; }
    .error-state button { margin-top: .5rem; }
    .load-more { display: flex; justify-content: center; margin-top: 3.5rem; }
    .load-more button { background: transparent; border-color: #22d3ee; color: #a5f3fc; }
    @keyframes reveal { from { opacity: 0; transform: translateY(18px); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 860px) {
      .article-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .filters { grid-template-columns: 1fr 1fr; }
      .filters button { grid-column: 1 / -1; }
    }
    @media (max-width: 580px) {
      .blog-hero { min-height: 470px; padding-bottom: 3rem; }
      .blog-content { padding-top: 3.5rem; }
      .section-heading { align-items: start; flex-direction: column; gap: .75rem; }
      .filters, .article-grid { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
    }
  `],
})
export class BlogListComponent implements OnInit {
  articles: Article[] = [];
  categories: Category[] = [];
  query = '';
  categoryId = '';
  page = 0;
  readonly pageSize = 9;
  total = 0;
  loading = true;
  error = false;

  constructor(
    private readonly blog: BlogService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  get hasMore(): boolean {
    return this.articles.length < this.total;
  }

  ngOnInit(): void {
    this.blog.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.markForCheck();
      },
      error: () => {
        this.categories = [];
        this.cdr.markForCheck();
      },
    });
    this.load(true);
  }

  search(): void {
    this.load(true);
  }

  load(reset: boolean): void {
    if (reset) {
      this.page = 0;
      this.articles = [];
    }
    this.loading = true;
    this.error = false;
    this.blog.listPublished({
      page: this.page,
      limit: this.pageSize,
      q: this.query,
      categoryId: this.categoryId,
    }).subscribe({
      next: (response) => {
        this.articles = reset ? response.data : [...this.articles, ...response.data];
        this.total = response.total;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      },
    });
  }

  loadMore(): void {
    this.page += 1;
    this.load(false);
  }

  trackBySlug(_: number, article: Article): string {
    return article.slug ?? article._id ?? article.title;
  }

  formatPublishedAt(value?: string): string {
    return value
      ? new Intl.DateTimeFormat('es-MX', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }).format(new Date(value))
      : '';
  }
}
