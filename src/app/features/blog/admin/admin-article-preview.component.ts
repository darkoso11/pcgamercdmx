import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { adminUrl } from '../../admin/admin-route.config';
import { ArticleMediaComponent } from '../article-media.component';

@Component({
  selector: 'app-admin-article-preview',
  standalone: true,
  imports: [CommonModule, RouterModule, ArticleMediaComponent],
  template: `
    <main class="preview-page">
      <div class="preview-bar">
        <div>
          <strong>Vista previa privada</strong>
          <span>Esta entrada todavía no es pública.</span>
        </div>
        <a [routerLink]="editorUrl">Volver al editor</a>
      </div>

      <article *ngIf="article; else unavailable">
        <header>
          <p>Vista editorial · PC Gamer CDMX</p>
          <h1>{{ article.title || 'Entrada sin título' }}</h1>
          <div class="summary">{{ article.summary }}</div>
        </header>
        <figure *ngIf="article.coverImage?.url">
          <img [src]="article.coverImage?.url" [alt]="article.coverImage?.alt || ''" />
        </figure>
        <div class="body">
          <section *ngFor="let section of article.sections">
            <h2 *ngIf="section.title">{{ section.title }}</h2>
            <div class="rich-text" [innerHTML]="section.text || ''"></div>
            <div class="images" *ngIf="section.images?.length">
              <figure *ngFor="let image of section.images">
                <img [src]="image.preview || image.url" [alt]="image.alt || ''" />
                <figcaption *ngIf="image.alt">{{ image.alt }}</figcaption>
              </figure>
            </div>
            <div class="media" *ngIf="section.media?.length">
              <app-article-media
                *ngFor="let media of section.media"
                [media]="media"
              ></app-article-media>
            </div>
          </section>
        </div>
      </article>

      <ng-template #unavailable>
        <div class="empty">
          <h1>No hay una vista previa disponible.</h1>
          <a [routerLink]="editorUrl">Volver al editor</a>
        </div>
      </ng-template>
    </main>
  `,
  styles: [`
    :host { display:block; background:#07111f; color:#f8fafc; min-height:100vh; }
    .preview-page { padding: 7rem 1.5rem 5rem; }
    .preview-bar { position:sticky; top:1rem; z-index:2; width:min(1080px,100%); margin:0 auto 3rem;
      display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1rem 1.2rem;
      border:1px solid #22d3ee; border-radius:10px; background:#083344; box-shadow:0 14px 40px #0007; }
    .preview-bar strong, .preview-bar span { display:block; }
    .preview-bar span { color:#cbd5e1; font-size:.82rem; margin-top:.2rem; }
    a { color:#a5f3fc; font-weight:800; }
    article { width:min(940px,100%); margin:0 auto; }
    header { max-width:820px; }
    header p { color:#67e8f9; font-size:.76rem; font-weight:850; letter-spacing:.14em; text-transform:uppercase; }
    h1 { margin:.8rem 0 1.2rem; font-size:clamp(2.8rem,7vw,5.6rem); line-height:.98; letter-spacing:-.055em; }
    .summary { color:#c5d2e1; font-size:1.18rem; line-height:1.7; }
    article > figure { margin:3rem 0 0; }
    img { display:block; width:100%; border-radius:12px; }
    .body { width:min(720px,100%); margin:4rem auto 0; color:#d7e2ef; font-size:1.08rem; line-height:1.82; }
    section + section { margin-top:3rem; padding-top:3rem; border-top:1px solid #263a55; }
    h2 { color:#fff; font-size:2rem; }
    .images, .media { display:grid; gap:1rem; margin-top:2rem; }
    figcaption { color:#9db1c8; margin-top:.5rem; }
    .empty { width:min(720px,100%); margin:5rem auto; }
    :is(a):focus-visible { outline:3px solid #fff; outline-offset:3px; }
  `],
})
export class AdminArticlePreviewComponent {
  private readonly preview = this.readPreview();
  readonly editorUrl = this.preview.returnUrl || adminUrl('blog/new');
  readonly article = this.preview.article;

  private readPreview(): { article: any; returnUrl: string } {
    try {
      const raw = sessionStorage.getItem('pcg_blog_preview');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.article) {
        return {
          article: parsed.article,
          returnUrl: parsed.returnUrl || adminUrl('blog/new'),
        };
      }
      return {
        article: parsed,
        returnUrl: adminUrl('blog/new'),
      };
    } catch {
      return {
        article: null,
        returnUrl: adminUrl('blog/new'),
      };
    }
  }
}
