import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article } from '../models/types';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private base = '/api/blog';
  constructor(private http: HttpClient) {}

  list(params?: Record<string, any>): Observable<any> {
    let httpParams = new HttpParams();
    if (params) Object.keys(params).forEach(k => httpParams = httpParams.set(k, params[k]));
    return this.http.get(`${this.base}/articles`, { params: httpParams });
  }

  getBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`${this.base}/articles/${slug}`);
  }

  create(payload: Partial<Article>): Observable<any> {
    return this.http.post(`${this.base}/articles`, payload);
  }

  update(id: string, payload: Partial<Article>): Observable<any> {
    return this.http.put(`${this.base}/articles/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.base}/articles/${id}`);
  }

  // Categories
  getCategories(): Observable<any> {
    return this.http.get(`${this.base}/categories`);
  }

  createCategory(payload: { name: string; description?: string }): Observable<any> {
    return this.http.post(`${this.base}/categories`, payload);
  }

  updateCategory(id: string, payload: { name?: string; description?: string }): Observable<any> {
    return this.http.put(`${this.base}/categories/${id}`, payload);
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.base}/categories/${id}`);
  }

  // Subcategories
  getSubCategories(categoryId?: string): Observable<any> {
    const params: any = {};
    if (categoryId) params.categoryId = categoryId;
    return this.http.get(`${this.base}/subcategories`, { params });
  }

  createSubCategory(payload: { name: string; categoryId: string; description?: string }): Observable<any> {
    return this.http.post(`${this.base}/subcategories`, payload);
  }

  updateSubCategory(id: string, payload: { name?: string; description?: string }): Observable<any> {
    return this.http.put(`${this.base}/subcategories/${id}`, payload);
  }

  deleteSubCategory(id: string): Observable<any> {
    return this.http.delete(`${this.base}/subcategories/${id}`);
  }
}
