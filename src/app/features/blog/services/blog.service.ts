import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DirectusApiService } from '../../../core/services/directus-api.service';
import {
  DirectusBlogPostRecord,
  DirectusCategoryRecord,
  DirectusSubcategoryRecord,
  mapArticleToDirectusPayload,
  mapBlogCategoryToDirectusPayload,
  mapBlogSubcategoryToDirectusPayload,
  mapDirectusBlogPostToArticle,
  mapDirectusCategoryToBlogCategory,
  mapDirectusSubcategoryToBlogSubcategory,
} from '../../../core/services/directus-content.mapper';
import { Article, Category, SubCategory } from '../models/types';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly postsCollection = 'pc_blog_posts';
  private readonly categoriesCollection = 'pc_categories';
  private readonly subcategoriesCollection = 'pc_subcategories';

  constructor(private readonly directus: DirectusApiService) {}

  list(params: Record<string, any> = {}): Observable<{ data: Article[]; total: number }> {
    if (!this.directus.isEnabled('blog')) {
      return of({ data: [], total: 0 });
    }

    return this.directus
      .readItems<DirectusBlogPostRecord>(
        this.postsCollection,
        {
          fields: '*',
          sort: '-published_at',
          limit: 1000,
        },
        { auth: true }
      )
      .pipe(
        map((response) => {
          const page = Number(params['page'] ?? 0);
          const limit = Number(params['limit'] ?? 10);
          const filtered = this.filterArticles(
            response.data.map(mapDirectusBlogPostToArticle),
            params
          );

          return {
            data: filtered.slice(page * limit, page * limit + limit),
            total: filtered.length,
          };
        })
      );
  }

  getBySlug(slug: string): Observable<Article> {
    return this.findPost({ 'filter[slug][_eq]': slug });
  }

  getById(id: string): Observable<Article> {
    return this.directus
      .readItem<DirectusBlogPostRecord>(
        this.postsCollection,
        id,
        { fields: '*' },
        { auth: true }
      )
      .pipe(map((response) => mapDirectusBlogPostToArticle(response.data)));
  }

  create(payload: Partial<Article>): Observable<Article> {
    return this.directus
      .createItem<DirectusBlogPostRecord>(
        this.postsCollection,
        mapArticleToDirectusPayload(payload) as unknown as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusBlogPostToArticle(response.data)));
  }

  update(id: string, payload: Partial<Article>): Observable<Article> {
    return this.directus
      .updateItem<DirectusBlogPostRecord>(
        this.postsCollection,
        id,
        mapArticleToDirectusPayload(payload) as unknown as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusBlogPostToArticle(response.data)));
  }

  delete(id: string): Observable<void> {
    return this.directus.deleteItem(this.postsCollection, id, { auth: true });
  }

  getCategories(): Observable<Category[]> {
    return this.directus
      .readItems<DirectusCategoryRecord>(
        this.categoriesCollection,
        { fields: '*', sort: 'sort,name', limit: 100 },
        { auth: true }
      )
      .pipe(map((response) => response.data.map(mapDirectusCategoryToBlogCategory)));
  }

  createCategory(payload: { name: string; description?: string }): Observable<Category> {
    return this.directus
      .createItem<DirectusCategoryRecord>(
        this.categoriesCollection,
        mapBlogCategoryToDirectusPayload(payload) as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusCategoryToBlogCategory(response.data)));
  }

  updateCategory(id: string, payload: { name?: string; description?: string }): Observable<Category> {
    return this.directus
      .updateItem<DirectusCategoryRecord>(
        this.categoriesCollection,
        id,
        mapBlogCategoryToDirectusPayload(payload) as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusCategoryToBlogCategory(response.data)));
  }

  deleteCategory(id: string): Observable<void> {
    return this.directus.deleteItem(this.categoriesCollection, id, { auth: true });
  }

  getSubCategories(categoryId?: string): Observable<SubCategory[]> {
    const query: Record<string, string | number | boolean> = {
      fields: '*',
      sort: 'sort,name',
      limit: 200,
    };

    if (categoryId) {
      query['filter[category_id][_eq]'] = categoryId;
    }

    return this.directus
      .readItems<DirectusSubcategoryRecord>(
        this.subcategoriesCollection,
        query,
        { auth: true }
      )
      .pipe(
        map((response) => response.data.map(mapDirectusSubcategoryToBlogSubcategory)),
        catchError(() => of([]))
      );
  }

  createSubCategory(payload: { name: string; categoryId: string; description?: string }): Observable<SubCategory> {
    return this.directus
      .createItem<DirectusSubcategoryRecord>(
        this.subcategoriesCollection,
        mapBlogSubcategoryToDirectusPayload(payload) as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusSubcategoryToBlogSubcategory(response.data)));
  }

  updateSubCategory(id: string, payload: { name?: string; description?: string }): Observable<SubCategory> {
    return this.directus
      .updateItem<DirectusSubcategoryRecord>(
        this.subcategoriesCollection,
        id,
        mapBlogSubcategoryToDirectusPayload(payload) as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusSubcategoryToBlogSubcategory(response.data)));
  }

  deleteSubCategory(id: string): Observable<void> {
    return this.directus.deleteItem(this.subcategoriesCollection, id, { auth: true });
  }

  private findPost(query: Record<string, string | number | boolean>): Observable<Article> {
    return this.directus
      .readItems<DirectusBlogPostRecord>(
        this.postsCollection,
        {
          ...query,
          fields: '*',
          limit: 1,
        },
        { auth: true }
      )
      .pipe(map((response) => mapDirectusBlogPostToArticle(response.data[0])));
  }

  private filterArticles(articles: Article[], params: Record<string, any>): Article[] {
    const q = String(params['q'] ?? '').trim().toLowerCase();
    const tags = String(params['tags'] ?? '').trim().toLowerCase();
    const categoryId = String(params['categoryId'] ?? '');
    const subCategoryId = String(params['subCategoryId'] ?? '');
    const dateFrom = String(params['dateFrom'] ?? '');
    const dateTo = String(params['dateTo'] ?? '');
    const hasPublished = params['published'] !== undefined && params['published'] !== '';
    const published = params['published'] === true || params['published'] === 'true';

    return articles.filter((article) => {
      const text = `${article.title} ${article.summary ?? ''}`.toLowerCase();
      const articleTags = (article.tags ?? []).map((tag) => tag.toLowerCase());
      const publishedAt = article.publishedAt ? new Date(article.publishedAt).getTime() : 0;

      return (
        (!q || text.includes(q)) &&
        (!tags || articleTags.some((tag) => tag.includes(tags))) &&
        (!categoryId || article.categoryId === categoryId) &&
        (!subCategoryId || article.subCategoryId === subCategoryId) &&
        (!hasPublished || article.published === published) &&
        (!dateFrom || publishedAt >= new Date(dateFrom).getTime()) &&
        (!dateTo || publishedAt <= new Date(dateTo).getTime())
      );
    });
  }
}
