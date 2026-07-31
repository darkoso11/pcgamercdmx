import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DirectusApiService } from './directus-api.service';
import {
  clearStoredDirectusSession,
  getStoredDirectusAccessToken,
  getStoredDirectusRefreshToken,
  setStoredDirectusSession,
} from './directus-auth.storage';

describe('DirectusApiService', () => {
  let service: DirectusApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'https://cms.test.pcgamercdmx.com';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(DirectusApiService);
    httpMock = TestBed.inject(HttpTestingController);
    clearStoredDirectusSession();
  });

  afterEach(() => {
    httpMock.verify();
    clearStoredDirectusSession();
  });

  it('refreshes the session and retries authenticated reads after a 401', () => {
    setStoredDirectusSession('expired-access', 'valid-refresh');
    let result: unknown;

    service.readItems('pc_products', { fields: '*' }, { auth: true }).subscribe((response) => {
      result = response.data;
    });

    const firstRead = httpMock.expectOne(`${baseUrl}/items/pc_products?fields=*`);
    expect(firstRead.request.headers.get('Authorization')).toBe('Bearer expired-access');
    firstRead.flush({ errors: [{ message: 'Invalid user credentials.' }] }, { status: 401, statusText: 'Unauthorized' });

    const refresh = httpMock.expectOne(`${baseUrl}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refresh_token: 'valid-refresh', mode: 'json' });
    refresh.flush({
      data: {
        access_token: 'fresh-access',
        refresh_token: 'fresh-refresh',
        expires: 900000,
      },
    });

    const retryRead = httpMock.expectOne(`${baseUrl}/items/pc_products?fields=*`);
    expect(retryRead.request.headers.get('Authorization')).toBe('Bearer fresh-access');
    retryRead.flush({ data: [{ id: 1, title: 'Producto' }] });

    expect(result).toEqual([{ id: 1, title: 'Producto' }]);
    expect(getStoredDirectusAccessToken()).toBe('fresh-access');
    expect(getStoredDirectusRefreshToken()).toBe('fresh-refresh');
  });

  it('clears the stored session when refresh fails', () => {
    setStoredDirectusSession('expired-access', 'expired-refresh');
    let errorStatus = 0;

    service.createItem('pc_products', { title: 'Producto' }, { auth: true }).subscribe({
      error: (error) => {
        errorStatus = error.status;
      },
    });

    const create = httpMock.expectOne(`${baseUrl}/items/pc_products`);
    create.flush({ errors: [{ message: 'Invalid user credentials.' }] }, { status: 401, statusText: 'Unauthorized' });

    const refresh = httpMock.expectOne(`${baseUrl}/auth/refresh`);
    refresh.flush({ errors: [{ message: 'Invalid refresh token.' }] }, { status: 401, statusText: 'Unauthorized' });

    expect(errorStatus).toBe(401);
    expect(getStoredDirectusAccessToken()).toBeNull();
    expect(getStoredDirectusRefreshToken()).toBeNull();
  });

  it('does not refresh the session for non-auth errors', () => {
    setStoredDirectusSession('valid-access', 'valid-refresh');
    let errorStatus = 0;

    service.updateItem('pc_products', 1, { title: 'Producto' }, { auth: true }).subscribe({
      error: (error) => {
        errorStatus = error.status;
      },
    });

    const update = httpMock.expectOne(`${baseUrl}/items/pc_products/1`);
    update.flush({ errors: [{ message: 'Validation failed.' }] }, { status: 422, statusText: 'Unprocessable Entity' });

    httpMock.expectNone(`${baseUrl}/auth/refresh`);
    expect(errorStatus).toBe(422);
    expect(getStoredDirectusAccessToken()).toBe('valid-access');
    expect(getStoredDirectusRefreshToken()).toBe('valid-refresh');
  });

  it('refreshes the session and retries authenticated deletes after a 401', () => {
    setStoredDirectusSession('expired-access', 'valid-refresh');
    let completed = false;

    service.deleteItem('pc_products', 1, { auth: true }).subscribe(() => {
      completed = true;
    });

    const firstDelete = httpMock.expectOne(`${baseUrl}/items/pc_products/1`);
    expect(firstDelete.request.method).toBe('DELETE');
    expect(firstDelete.request.headers.get('Authorization')).toBe('Bearer expired-access');
    firstDelete.flush({ errors: [{ message: 'Invalid user credentials.' }] }, { status: 401, statusText: 'Unauthorized' });

    const refresh = httpMock.expectOne(`${baseUrl}/auth/refresh`);
    refresh.flush({
      data: {
        access_token: 'fresh-access',
        refresh_token: 'fresh-refresh',
        expires: 900000,
      },
    });

    const retryDelete = httpMock.expectOne(`${baseUrl}/items/pc_products/1`);
    expect(retryDelete.request.method).toBe('DELETE');
    expect(retryDelete.request.headers.get('Authorization')).toBe('Bearer fresh-access');
    retryDelete.flush(null);

    expect(completed).toBeTrue();
    expect(getStoredDirectusAccessToken()).toBe('fresh-access');
    expect(getStoredDirectusRefreshToken()).toBe('fresh-refresh');
  });

  it('shares one refresh request across concurrent authenticated requests', () => {
    setStoredDirectusSession('expired-access', 'valid-refresh');
    const results: unknown[] = [];

    service.readItems('pc_blog_posts', {}, { auth: true }).subscribe((response) => {
      results.push(response.data);
    });
    service.readItems('pc_blog_categories', {}, { auth: true }).subscribe((response) => {
      results.push(response.data);
    });

    const posts = httpMock.expectOne(`${baseUrl}/items/pc_blog_posts`);
    const categories = httpMock.expectOne(`${baseUrl}/items/pc_blog_categories`);
    posts.flush({}, { status: 401, statusText: 'Unauthorized' });
    categories.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refresh = httpMock.expectOne(`${baseUrl}/auth/refresh`);
    refresh.flush({
      data: {
        access_token: 'fresh-access',
        refresh_token: 'fresh-refresh',
        expires: 900000,
      },
    });

    httpMock.expectOne(`${baseUrl}/items/pc_blog_posts`).flush({ data: [{ id: 1 }] });
    httpMock.expectOne(`${baseUrl}/items/pc_blog_categories`).flush({ data: [{ id: 2 }] });

    expect(results).toEqual([[{ id: 1 }], [{ id: 2 }]]);
  });

  it('does not refresh or clear the session after a permission error', () => {
    setStoredDirectusSession('valid-access', 'valid-refresh');
    let errorStatus = 0;

    service.readItems('pc_blog_categories', {}, { auth: true }).subscribe({
      error: (error) => {
        errorStatus = error.status;
      },
    });

    httpMock.expectOne(`${baseUrl}/items/pc_blog_categories`).flush(
      { errors: [{ message: 'Forbidden' }] },
      { status: 403, statusText: 'Forbidden' }
    );

    httpMock.expectNone(`${baseUrl}/auth/refresh`);
    expect(errorStatus).toBe(403);
    expect(getStoredDirectusAccessToken()).toBe('valid-access');
    expect(getStoredDirectusRefreshToken()).toBe('valid-refresh');
  });
});
