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
    <section *ngIf="posts.length" class="py-16 bg-[#0a0d22] relative overflow-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent"></div>
        <div class="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-sky-400 to-transparent"></div>
      </div>

      <h2 class="text-4xl font-bold text-white text-center mb-16 relative before:content-[''] before:absolute before:h-1 before:w-12 before:bg-cyan-400 before:-bottom-3 before:left-1/2 before:-translate-x-1/2">
        Ultimas del Blog
      </h2>

      <div
        class="grid grid-cols-1 gap-8 mx-auto px-4"
        [ngClass]="{
          'max-w-xl': posts.length === 1,
          'max-w-4xl': posts.length === 2,
          'max-w-7xl': posts.length >= 3,
          'md:grid-cols-2': posts.length >= 2,
          'lg:grid-cols-3': posts.length >= 3
        }"
      >
        <article *ngFor="let post of posts">
          <a [routerLink]="['/blog', post.slug]" class="block h-full bg-[#161a3c] rounded-xl overflow-hidden group hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            <div class="home-blog-cover h-48 overflow-hidden bg-[#0b1a2d]">
              <img
                *ngIf="hasWorkingImage(post); else coverFallback"
                [src]="post.image"
                [alt]="post.title"
                loading="lazy"
                decoding="async"
                (error)="markImageFailed(post)"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <ng-template #coverFallback>
                <div
                  data-testid="blog-cover-fallback"
                  class="h-full grid place-items-center bg-[radial-gradient(circle_at_70%_20%,rgba(34,211,238,.25),transparent_35%),linear-gradient(135deg,#0b1a2d,#07111f)] text-cyan-200 text-3xl font-bold tracking-[.18em]"
                  aria-hidden="true"
                >
                  PCG
                </div>
              </ng-template>
            </div>
            <div class="p-6">
              <span class="text-xs text-cyan-400">{{ post.date | date }}</span>
              <h3 class="text-xl font-bold text-white mt-2 group-hover:text-cyan-400 transition-colors">
                {{ post.title }}
              </h3>
              <p class="text-gray-300 text-sm mt-2 line-clamp-2">{{ post.excerpt }}</p>
            </div>
          </a>
        </article>
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
  private readonly failedImages = new Set<string>();

  hasWorkingImage(post: HomeBlogPost): boolean {
    return Boolean(post.image && !this.failedImages.has(post.image));
  }

  markImageFailed(post: HomeBlogPost): void {
    if (post.image) {
      this.failedImages.add(post.image);
    }
  }
}
