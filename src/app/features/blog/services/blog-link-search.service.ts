import { Injectable } from '@angular/core';
import { map, timeout } from 'rxjs/operators';
import { DirectusApiService } from '../../../core/services/directus-api.service';

export type BlogLinkKind = 'article' | 'product' | 'assembly';
export interface BlogLinkResult { title: string; link: string; }

@Injectable({ providedIn: 'root' })
export class BlogLinkSearchService {
  constructor(private readonly directus: DirectusApiService) {}

  search(kind: BlogLinkKind, text: string) {
    const query: Record<string, string | number | boolean> = { 'filter[published][_eq]': true, 'filter[title][_icontains]': text.trim(), fields: 'title,slug', limit: 12, sort: 'title' };
    if (kind === 'article') query['filter[published_at][_lte]'] = new Date().toISOString();
    else query[`filter[category][_${kind === 'assembly' ? 'eq' : 'neq'}]`] = 'assembled';
    const prefix = kind === 'article' ? '/blog/' : kind === 'assembly' ? '/ensambles/' : '/productos/';
    return this.directus.readItems<{ title: string; slug: string }>(kind === 'article' ? 'pc_blog_posts' : 'pc_products', query).pipe(
      timeout(15000),
      map(response => response.data.filter(item => item.slug && item.title).map(item => ({ title: item.title, link: prefix + encodeURIComponent(item.slug) }))),
    );
  }
}
