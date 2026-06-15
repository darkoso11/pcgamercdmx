import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface HomeBlogPost {
  title: string;
  excerpt: string;
  image: string;
  date: Date;
  slug: string;
}

@Component({
  selector: 'app-home-blog-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-16 bg-[#0a0d22] relative overflow-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent"></div>
        <div class="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-sky-400 to-transparent"></div>
      </div>

      <h2 class="text-4xl font-bold text-white text-center mb-16 relative before:content-[''] before:absolute before:h-1 before:w-12 before:bg-cyan-400 before:-bottom-3 before:left-1/2 before:-translate-x-1/2">
        Ultimas del Blog
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
        <ng-container *ngFor="let post of posts">
          <a [routerLink]="['/blog', post.slug]" class="block bg-[#161a3c] rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            <div class="h-48 overflow-hidden">
              <img [src]="post.image" [alt]="post.title" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div class="p-6">
              <span class="text-xs text-cyan-400">{{ post.date | date }}</span>
              <h3 class="text-xl font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors">
                {{ post.title }}
              </h3>
              <p class="text-gray-300 text-sm mt-2 line-clamp-2">{{ post.excerpt }}</p>
            </div>
          </a>
        </ng-container>
      </div>

      <div class="text-center mt-12">
        <a routerLink="/blog" class="border-2 border-cyan-400 text-cyan-400 py-3 px-8 rounded-lg font-bold hover:bg-cyan-400 hover:text-[#0a0d22] transition-colors">
          Ver mas articulos
        </a>
      </div>
    </section>
  `,
})
export class HomeBlogSectionComponent {
  @Input({ required: true }) posts: HomeBlogPost[] = [];
}
