import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Article } from '../models/types';

// Mock in-memory store with localStorage persistence
const ARTICLES_KEY = 'mock_blog_articles_v1';
let mockArticles: Article[] = (() => {
  try {
    const raw = localStorage.getItem(ARTICLES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore JSON parse/localStorage errors
  }
  const initial: Article[] = [
    {
      _id: '1',
      title: 'Guía Completa de RTX 4090',
      slug: 'guia-rtx-4090',
      summary: 'Todo lo que necesitas saber sobre la GPU más potente del mercado.',
      coverImage: { url: 'https://picsum.photos/800/400?random=1', alt: 'RTX 4090' },
      sections: [
        {
          id: 's1',
          title: 'Especificaciones',
          text: '<p>La RTX 4090 es la tarjeta gráfica más potente de NVIDIA.</p>',
          order: 0
        }
      ],
      categoryId: 'cat1',
      tags: ['GPU', 'NVIDIA', 'RTX'],
      published: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: '2',
      title: 'Procesadores de 14ª Generación Intel',
      slug: 'procesadores-intel-14-gen',
      summary: 'Análisis de los nuevos CPUs de Intel con arquitectura Raptor Lake Refresh.',
      coverImage: { url: 'https://picsum.photos/800/400?random=2', alt: 'Intel i9-14900K' },
      sections: [
        {
          id: 's1',
          title: 'Rendimiento',
          text: '<p>Los procesadores de 14ª gen ofrecen un rendimiento superior al anterior ciclo.</p>',
          order: 0
        }
      ],
      categoryId: 'cat2',
      tags: ['Intel', 'CPU', 'Rendimiento'],
      published: true,
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  try { localStorage.setItem(ARTICLES_KEY, JSON.stringify(initial)); } catch (e) {}
  return initial;
})();

// Mock categories
const CATEGORIES_KEY = 'mock_blog_categories_v1';
let mockCategories: { _id: string; name: string; description?: string }[] = (() => {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore JSON parse/localStorage errors
  }
  const initial = [
    { _id: 'cat1', name: 'Hardware', description: 'Noticias de hardware' },
    { _id: 'cat2', name: 'Software', description: 'Noticias de software' },
    { _id: 'cat3', name: 'Gaming', description: 'Gaming y esports' }
  ];
  try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(initial)); } catch (e) {}
  return initial;
})();

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only intercept /api/blog routes
    if (!req.url.includes('/api/blog')) {
      return next.handle(req);
    }

    // POST /api/blog/login
    if (req.method === 'POST' && req.url.includes('/api/blog/login')) {
      const { password } = req.body;
      if (password === 'admin') {
        return of(new HttpResponse({
          status: 200,
          body: { token: 'mock-jwt-token-' + Date.now() }
        }));
      }
      return throwError(() => new Error('Invalid password'));
    }

    // GET /api/blog/articles (list with optional filters)
    if (req.method === 'GET' && req.url.match(/\/api\/blog\/articles\/?$/)) {
      const params = new URLSearchParams(req.url.split('?')[1] || '');
      let filtered = [...mockArticles];

      // Filter by search query
      const q = params.get('q');
      if (q) {
        const qLower = q.toLowerCase();
        filtered = filtered.filter(a =>
          a.title.toLowerCase().includes(qLower) ||
          (a.summary || '').toLowerCase().includes(qLower)
        );
      }

      // Filter by category
      const categoryId = params.get('categoryId');
      if (categoryId) {
        filtered = filtered.filter(a => a.categoryId === categoryId);
      }

      // Pagination
      const page = parseInt(params.get('page') || '0', 10);
      const limit = parseInt(params.get('limit') || '10', 10);
      const start = page * limit;
      const end = start + limit;

      return of(new HttpResponse({
        status: 200,
        body: {
          data: filtered.slice(start, end),
          total: filtered.length,
          page,
          limit
        }
      }));
    }

    // GET /api/blog/articles/:slug
    if (req.method === 'GET' && req.url.match(/\/api\/blog\/articles\/[^/]+$/)) {
      const slug = req.url.split('/').pop();
      const article = mockArticles.find(a => a.slug === slug);
      if (article) {
        return of(new HttpResponse({ status: 200, body: article }));
      }
      return throwError(() => new Error('Article not found'));
    }

    // POST /api/blog/articles (create)
    if (req.method === 'POST' && req.url.includes('/api/blog/articles')) {
      const newArticle: Article = {
        _id: String(Date.now()),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockArticles.push(newArticle);
      try { localStorage.setItem(ARTICLES_KEY, JSON.stringify(mockArticles)); } catch (e) {}
      console.log('Mock: Article created', newArticle);
      return of(new HttpResponse({ status: 201, body: newArticle }));
    }

    // PUT /api/blog/articles/:id (update)
    if (req.method === 'PUT' && req.url.match(/\/api\/blog\/articles\/[^/]+$/)) {
      const id = req.url.split('/').pop();
      const idx = mockArticles.findIndex(a => a._id === id);
      if (idx >= 0) {
        mockArticles[idx] = {
          ...mockArticles[idx],
          ...req.body,
          updatedAt: new Date().toISOString()
        };
        try { localStorage.setItem(ARTICLES_KEY, JSON.stringify(mockArticles)); } catch (e) {}
        console.log('Mock: Article updated', mockArticles[idx]);
        return of(new HttpResponse({ status: 200, body: mockArticles[idx] }));
      }
      return throwError(() => new Error('Article not found'));
    }

    // DELETE /api/blog/articles/:id
    if (req.method === 'DELETE' && req.url.match(/\/api\/blog\/articles\/[^/]+$/)) {
      const id = req.url.split('/').pop();
      const idx = mockArticles.findIndex(a => a._id === id);
      if (idx >= 0) {
        const deleted = mockArticles.splice(idx, 1)[0];
        try { localStorage.setItem(ARTICLES_KEY, JSON.stringify(mockArticles)); } catch (e) {}
        console.log('Mock: Article deleted', deleted);
        return of(new HttpResponse({ status: 200, body: { success: true } }));
      }
      return throwError(() => new Error('Article not found'));
    }

    // POST /api/blog/uploads/sign (signed URL generation)
    if (req.method === 'POST' && req.url.includes('/api/blog/uploads/sign')) {
      const { filename } = req.body;
      const publicUrl = `https://mock-s3.example.com/uploads/${Date.now()}-${filename}`;
      const signedUrl = publicUrl + '?signed=mock';
      return of(new HttpResponse({
        status: 200,
        body: { signedUrl, publicUrl }
      }));
    }

    // GET /api/blog/categories
    if (req.method === 'GET' && req.url.includes('/api/blog/categories')) {
      return of(new HttpResponse({ status: 200, body: mockCategories }));
    }

    // POST /api/blog/categories (create category)
    if (req.method === 'POST' && req.url.includes('/api/blog/categories')) {
      const body = req.body || {};
      const newCat = { _id: String(Date.now()), name: body.name || 'Sin nombre', description: body.description || '' };
      mockCategories.push(newCat);
      try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(mockCategories)); } catch (e) {}
      console.log('Mock: Category created', newCat);
      return of(new HttpResponse({ status: 201, body: newCat }));
    }

    // PUT /api/blog/categories/:id
    if (req.method === 'PUT' && req.url.match(/\/api\/blog\/categories\/[^/]+$/)) {
      const id = req.url.split('/').pop();
      const idx = mockCategories.findIndex(c => c._id === id);
      if (idx >= 0) {
        mockCategories[idx] = { ...mockCategories[idx], ...(req.body || {}) };
        try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(mockCategories)); } catch (e) {}
        console.log('Mock: Category updated', mockCategories[idx]);
        return of(new HttpResponse({ status: 200, body: mockCategories[idx] }));
      }
      return throwError(() => new Error('Category not found'));
    }

    // DELETE /api/blog/categories/:id
    if (req.method === 'DELETE' && req.url.match(/\/api\/blog\/categories\/[^/]+$/)) {
      const id = req.url.split('/').pop();
      const idx = mockCategories.findIndex(c => c._id === id);
      if (idx >= 0) {
        const deleted = mockCategories.splice(idx, 1)[0];
        try { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(mockCategories)); } catch (e) {}
        console.log('Mock: Category deleted', deleted);
        return of(new HttpResponse({ status: 200, body: { success: true } }));
      }
      return throwError(() => new Error('Category not found'));
    }

    // Pass through any other requests
    return next.handle(req);
  }
}
