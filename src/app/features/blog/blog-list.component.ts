import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

type MinimalArticle = { title: string; slug: string; summary?: string; coverImage?: { url: string; alt?: string }; publishedAt?: string; tags?: string[] };

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="py-12 bg-[#071029]">
      <div class="max-w-7xl mx-auto px-4">
        <div class="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="md:col-span-3">
            <div class="rounded-xl overflow-hidden bg-gradient-to-r from-[#051024] via-[#071a33] to-[#051024] p-8 border border-cyan-400/10">
              <h1 class="text-4xl md:text-5xl font-extrabold text-white tracking-tight">El Blog — Noticias & Guías</h1>
              <p class="mt-2 text-gray-300">Análisis, tutoriales y novedades del mundo PC con estilo cyberpunk.</p>
            </div>
          </div>

          <div class="md:col-span-1 flex flex-col gap-3">
            <input [(ngModel)]="q" (ngModelChange)="applyFilter()" placeholder="Buscar artículos..." class="w-full p-3 rounded bg-[#081229] border border-cyan-400/10 text-white" />
            <select [(ngModel)]="selectedTag" (change)="applyFilter()" class="w-full p-3 rounded bg-[#081229] border border-cyan-400/10 text-white">
              <option value="">Todas las etiquetas</option>
              <option *ngFor="let t of tags" [value]="t">{{ t }}</option>
            </select>
            <a routerLink="/admin/blog" class="inline-block text-center mt-2 py-2 px-3 bg-pink-500 rounded text-white font-bold">Entrar al admin</a>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ng-container *ngFor="let a of displayed">
            <article class="group bg-[#0b1220] rounded-xl overflow-hidden border border-white/5 hover:shadow-[0_8px_40px_rgba(14,165,233,0.08)] transition">
              <a [routerLink]="['/blog', a.slug]" class="block">
                <div class="h-48 bg-black/40 overflow-hidden">
                  <img [src]="a.coverImage?.url || 'https://picsum.photos/800/400'" [alt]="a.coverImage?.alt || a.title" class="w-full h-full object-cover transform group-hover:scale-105 transition" />
                </div>
                <div class="p-4">
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-cyan-300">{{ a.publishedAt | date:'mediumDate' }}</div>
                    <div class="flex gap-2">
                      <span *ngFor="let t of a.tags || []" class="text-xs px-2 py-1 rounded bg-white/5 text-gray-200">{{ t }}</span>
                    </div>
                  </div>
                  <h3 class="mt-3 text-xl font-bold text-white">{{ a.title }}</h3>
                  <p class="mt-2 text-gray-300 text-sm line-clamp-3">{{ a.summary }}</p>
                </div>
              </a>
            </article>
          </ng-container>
        </div>

        <div class="mt-8 flex justify-center">
          <button (click)="loadMore()" class="px-6 py-2 bg-cyan-400 text-[#071029] rounded font-bold">Cargar más</button>
        </div>
      </div>
    </section>
  `
})
export class BlogListComponent implements OnInit {
  all: MinimalArticle[] = [];
  displayed: MinimalArticle[] = [];
  q = '';
  selectedTag = '';
  tags: string[] = [];
  page = 0;
  pageSize = 6;

  async ngOnInit() {
    try {
      const res = await fetch('/assets/mock/blog-sample.json');
      if (!res.ok) return;
      const data = await res.json();
      const items = Array.isArray(data) ? data : (data.articles || []);
      // normalize and map fields
      this.all = items.map((it: any) => ({
        title: it.title,
        slug: it.slug,
        summary: it.summary,
        coverImage: it.coverImage,
        publishedAt: it.publishedAt,
        tags: it.tags || []
      }));
      // collect tags
      const tagSet = new Set<string>();
      this.all.forEach(a => (a.tags || []).forEach(t => tagSet.add(t)));
      this.tags = Array.from(tagSet).sort();

      this.applyFilter();
    } catch (e) {
      // ignore
    }
  }

  applyFilter() {
    let list = [...this.all];
    if (this.q && this.q.trim()) {
      const q = this.q.trim().toLowerCase();
      list = list.filter(a => (a.title || '').toLowerCase().includes(q) || (a.summary || '').toLowerCase().includes(q));
    }
    if (this.selectedTag) {
      list = list.filter(a => (a.tags || []).includes(this.selectedTag));
    }
    this.page = 0;
    this.displayed = list.slice(0, this.pageSize);
  }

  loadMore() {
    this.page++;
    const start = this.page * this.pageSize;
    const more = this.all.slice(start, start + this.pageSize);
    this.displayed = [...this.displayed, ...more];
  }
}

