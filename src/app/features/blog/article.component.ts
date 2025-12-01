import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-article',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-[#071029] min-h-screen py-12">
      <div class="max-w-4xl mx-auto px-4">
        <a routerLink="/blog" class="text-cyan-300 hover:underline mb-6 inline-block">← Volver al Blog</a>

        <div *ngIf="!article" class="p-6 bg-[#0b1220] rounded-xl text-gray-300">Cargando artículo...</div>

        <article *ngIf="article" class="bg-[#071229] rounded-xl overflow-hidden border border-white/5">
          <div class="h-64 md:h-96 bg-black/40 overflow-hidden">
            <img [src]="article.coverImage?.url || '/assets/img/custom/sample-cover.jpg'" [alt]="article.coverImage?.alt || article.title" class="w-full h-full object-cover" />
          </div>

          <div class="p-6">
            <h1 class="text-3xl md:text-4xl font-bold text-white">{{ article.title }}</h1>
            <div class="mt-2 text-sm text-cyan-300">{{ article.publishedAt | date:'longDate' }}</div>

            <div class="mt-6 prose prose-invert max-w-none">
              <div [innerHTML]="articleHtml"></div>
            </div>
          </div>
        </article>
      </div>
    </div>
  `
})
export class ArticleComponent implements OnInit {
  article: any = null;
  articleHtml: SafeHtml = '' as SafeHtml;
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  async ngOnInit() {
    const slug = this.route.snapshot.params['slug'];
    // Try backend first; fallback to mock
    try {
      const res = await fetch(`/api/blog/articles/${slug}`);
      if (res.ok) {
        this.article = await res.json();
        const raw = (this.article.sections || []).map((s: any) => s.text || '').join('\n');
        this.articleHtml = this.sanitizer.bypassSecurityTrustHtml(raw);
        return;
      }
    } catch (e) {}

    try {
      const res = await fetch('/assets/mock/blog-sample.json');
      if (!res.ok) return;
      const data = await res.json();
      const found = (Array.isArray(data) ? data : data.articles || []).find((a: any) => a.slug === slug);
      if (found) {
        this.article = found;
        const raw = (found.sections || []).map((s: any) => s.text || '').join('\n');
        this.articleHtml = this.sanitizer.bypassSecurityTrustHtml(raw);
      }
    } catch (e) {}
  }
}
