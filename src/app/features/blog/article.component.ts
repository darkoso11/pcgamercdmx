import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Article, ArticleVideoEmbed } from './models/types';
import { BlogService } from './services/blog.service';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="article-page">
      <div class="article-shell">
        <a routerLink="/blog" class="back-link">
          <span aria-hidden="true">←</span> Volver al blog
        </a>

        <div class="state" *ngIf="loading" aria-live="polite">
          <span class="spinner" aria-hidden="true"></span>
          Cargando artículo…
        </div>

        <section class="state error" *ngIf="error" role="alert">
          <p class="eyebrow">Error de conexión</p>
          <h1>No pudimos abrir esta publicación.</h1>
          <p>Revisa tu conexión e inténtalo nuevamente.</p>
          <button type="button" (click)="load()">Reintentar</button>
        </section>

        <section class="state" *ngIf="notFound">
          <p class="eyebrow">404 · Publicación no encontrada</p>
          <h1>Esta entrada no está disponible.</h1>
          <p>Puede seguir como borrador, estar programada o haber cambiado de dirección.</p>
          <a routerLink="/blog" class="button-link">Explorar publicaciones</a>
        </section>

        <article *ngIf="article">
          <header class="article-header">
            <p class="eyebrow">{{ article.tags?.[0] || 'Guía PC Gamer CDMX' }}</p>
            <h1>{{ article.title }}</h1>
            <p class="summary">{{ article.summary }}</p>
            <time [attr.datetime]="article.publishedAt">
              {{ formatPublishedAt(article.publishedAt) }}
            </time>
          </header>

          <figure class="hero-media" *ngIf="article.coverImage?.url && !coverFailed">
            <img
              [src]="article.coverImage?.url"
              [alt]="article.coverImage?.alt || ''"
              (error)="handleCoverError()"
            />
          </figure>

          <div class="article-body">
            <section
              *ngFor="let section of article.sections"
              [attr.aria-labelledby]="section.title ? 'section-' + section.id : null"
            >
              <h2 *ngIf="section.title" [id]="'section-' + section.id">{{ section.title }}</h2>
              <div class="rich-text" [innerHTML]="section.text || ''"></div>

              <div class="media-grid" *ngIf="section.images?.length">
                <figure *ngFor="let image of section.images">
                  <img [src]="image.url" [alt]="image.alt || ''" loading="lazy" />
                  <figcaption *ngIf="image.alt">{{ image.alt }}</figcaption>
                </figure>
              </div>

              <div class="media-grid" *ngIf="section.media?.length">
                <ng-container *ngFor="let media of section.media">
                  <figure *ngIf="media.kind === 'image'">
                    <img [src]="media.url" [alt]="media.alt || ''" loading="lazy" />
                    <figcaption *ngIf="media.alt">{{ media.alt }}</figcaption>
                  </figure>
                  <figure *ngIf="media.kind === 'video-file'">
                    <video controls preload="metadata" [attr.aria-label]="media.title">
                      <source [src]="media.url" [type]="media.mimeType || 'video/mp4'" />
                    </video>
                    <figcaption>{{ media.title }}</figcaption>
                  </figure>
                  <figure *ngIf="media.kind === 'video-embed'" class="video-frame">
                    <iframe
                      [src]="embedUrl(media)"
                      [title]="media.title"
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                    <figcaption>{{ media.title }}</figcaption>
                  </figure>
                </ng-container>
              </div>

              <ul class="related-links" *ngIf="section.links?.length">
                <li *ngFor="let link of section.links">
                  <a [href]="link.link">{{ link.title }}</a>
                </li>
              </ul>
            </section>
          </div>
        </article>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; background: #07111f; color: #f8fafc; }
    .article-page { min-height: 100vh; padding: 8rem 1.5rem 6rem; }
    .article-shell { width: min(940px, 100%); margin: 0 auto; }
    .back-link { display: inline-flex; gap: .55rem; align-items: center; margin-bottom: 3.5rem;
      color: #8ee9f5; font-weight: 800; text-decoration: none; }
    .article-header { max-width: 820px; }
    .eyebrow { margin: 0 0 1rem; color: #67e8f9; font-size: .76rem; font-weight: 850;
      letter-spacing: .15em; text-transform: uppercase; }
    h1 { margin: 0; color: #fff; font-size: clamp(2.8rem, 7vw, 5.6rem); line-height: .98; letter-spacing: -.055em; }
    .summary { max-width: 720px; margin: 1.5rem 0; color: #c5d2e1; font-size: 1.18rem; line-height: 1.7; }
    time { color: #9db1c8; font-size: .9rem; }
    .hero-media { margin: 3.25rem 0 0; aspect-ratio: 16 / 9; overflow: hidden; border-radius: 14px; background: #0b1a2d; }
    .hero-media img { width: 100%; height: 100%; object-fit: cover; }
    .article-body { width: min(720px, 100%); margin: 4rem auto 0; }
    .article-body section + section { margin-top: 3.5rem; padding-top: 3.5rem; border-top: 1px solid #263a55; }
    .article-body h2 { margin: 0 0 1.2rem; color: #fff; font-size: clamp(1.7rem, 4vw, 2.5rem); letter-spacing: -.025em; }
    .rich-text { color: #d7e2ef; font-size: 1.08rem; line-height: 1.82; }
    .rich-text :is(p, ul, ol, blockquote, pre) { margin: 0 0 1.35rem; }
    .rich-text :is(a) { color: #67e8f9; text-underline-offset: 3px; }
    .media-grid { display: grid; gap: 1rem; margin-top: 2rem; }
    figure { margin: 0; }
    .media-grid img, .media-grid video { display: block; width: 100%; border-radius: 10px; }
    .video-frame iframe { display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 10px; }
    figcaption { margin-top: .6rem; color: #9db1c8; font-size: .82rem; }
    .related-links { padding-left: 1.2rem; }
    .related-links a { color: #67e8f9; }
    .state { min-height: 400px; display: flex; flex-direction: column; align-items: flex-start;
      justify-content: center; color: #c5d2e1; }
    .state h1 { max-width: 760px; font-size: clamp(2.4rem, 6vw, 4.5rem); }
    .state p:not(.eyebrow) { max-width: 640px; line-height: 1.7; }
    button, .button-link { min-height: 48px; display: inline-flex; align-items: center; justify-content: center;
      margin-top: 1rem; padding: 0 1.2rem; border: 0; border-radius: 8px; background: #22d3ee;
      color: #05242c; font: inherit; font-weight: 850; text-decoration: none; cursor: pointer; }
    .spinner { width: 28px; height: 28px; margin-bottom: 1rem; border: 3px solid #47627f;
      border-top-color: #67e8f9; border-radius: 50%; animation: spin .8s linear infinite; }
    a:focus-visible, button:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (prefers-reduced-motion: reduce) { * { animation-duration: .01ms !important; } }
  `],
})
export class ArticleComponent implements OnInit {
  article: Article | null = null;
  loading = true;
  error = false;
  notFound = false;
  coverFailed = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly blog: BlogService,
    private readonly sanitizer: DomSanitizer,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.loading = true;
    this.error = false;
    this.notFound = false;
    this.coverFailed = false;
    this.blog.getPublishedBySlug(slug).subscribe({
      next: (article) => {
        this.article = article;
        this.loading = false;
        this.notFound = !article;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.cdr.markForCheck();
      },
    });
  }

  embedUrl(media: ArticleVideoEmbed): SafeResourceUrl {
    const url = media.provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${media.externalId}`
      : `https://player.vimeo.com/video/${media.externalId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  handleCoverError(): void {
    this.coverFailed = true;
    this.cdr.markForCheck();
  }

  formatPublishedAt(value?: string): string {
    return value
      ? new Intl.DateTimeFormat('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date(value))
      : '';
  }
}
