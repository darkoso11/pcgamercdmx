import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  shareReplay,
  switchMap,
  timeout,
} from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  clearStoredDirectusSession,
  getStoredDirectusAccessToken,
  getStoredDirectusRefreshToken,
  isStoredDirectusAccessExpired,
  setStoredDirectusSession,
  updateStoredDirectusAccessExpiry,
} from './directus-auth.storage';

type DirectusFeature = keyof typeof environment.directus.features;
type DirectusQueryValue = string | number | boolean;

interface DirectusRequestOptions {
  auth?: boolean;
}

export interface DirectusListResponse<T> {
  data: T[];
  meta?: {
    filter_count?: number;
    total_count?: number;
  };
}

export interface DirectusItemResponse<T> {
  data: T;
}

export interface DirectusAuthResponse {
  data: {
    access_token: string;
    expires: number;
    refresh_token: string;
  };
}

export interface DirectusFileResponse {
  data: {
    id: string;
    filename_download?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class DirectusApiService {
  private readonly baseUrl = environment.directus.url.replace(/\/+$/, '');
  private refreshInFlight$: Observable<DirectusAuthResponse> | null = null;

  constructor(private readonly http: HttpClient) {}

  isEnabled(feature?: DirectusFeature): boolean {
    if (!environment.directus.enabled) {
      return false;
    }

    return feature ? Boolean(environment.directus.features[feature]) : true;
  }

  login(email: string, password: string): Observable<DirectusAuthResponse> {
    return this.http.post<DirectusAuthResponse>(`${this.baseUrl}/auth/login`, {
      email,
      password,
      mode: 'json',
    });
  }

  refreshSession(): Observable<DirectusAuthResponse> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = getStoredDirectusRefreshToken();
    if (!refreshToken) {
      clearStoredDirectusSession();
      return throwError(() => new Error('Missing Directus refresh token'));
    }

    this.refreshInFlight$ = this.http
      .post<DirectusAuthResponse>(`${this.baseUrl}/auth/refresh`, {
        refresh_token: refreshToken,
        mode: 'json',
      })
      .pipe(
        map((response) => {
          if (!response.data?.access_token) {
            clearStoredDirectusSession();
            throw new Error('Directus refresh did not return an access token');
          }

          setStoredDirectusSession(
            response.data.access_token,
            response.data.refresh_token
          );
          updateStoredDirectusAccessExpiry(
            Date.now() + response.data.expires
          );
          return response;
        }),
        catchError((error) => {
          clearStoredDirectusSession();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshInFlight$ = null;
        }),
        shareReplay({ bufferSize: 1, refCount: false })
      );

    return this.refreshInFlight$;
  }

  readItems<T>(
    collection: string,
    query: Record<string, DirectusQueryValue> = {},
    options: DirectusRequestOptions = {}
  ): Observable<DirectusListResponse<T>> {
    return this.withAuthRetry(
      () => this.http.get<DirectusListResponse<T>>(
        `${this.baseUrl}/items/${collection}`,
        {
          params: this.toParams(query),
          headers: this.toHeaders(options),
        }
      ),
      options
    );
  }

  readItem<T>(
    collection: string,
    id: string | number,
    query: Record<string, DirectusQueryValue> = {},
    options: DirectusRequestOptions = {}
  ): Observable<DirectusItemResponse<T>> {
    return this.withAuthRetry(
      () => this.http.get<DirectusItemResponse<T>>(
        `${this.baseUrl}/items/${collection}/${id}`,
        {
          params: this.toParams(query),
          headers: this.toHeaders(options),
        }
      ),
      options
    );
  }

  createItem<T>(
    collection: string,
    payload: Record<string, unknown>,
    options: DirectusRequestOptions = {}
  ): Observable<DirectusItemResponse<T>> {
    return this.withAuthRetry(
      () => this.http.post<DirectusItemResponse<T>>(
        `${this.baseUrl}/items/${collection}`,
        payload,
        { headers: this.toHeaders(options) }
      ),
      options
    ).pipe(timeout(60000));
  }

  updateItem<T>(
    collection: string,
    id: string | number,
    payload: Record<string, unknown>,
    options: DirectusRequestOptions = {}
  ): Observable<DirectusItemResponse<T>> {
    return this.withAuthRetry(
      () => this.http.patch<DirectusItemResponse<T>>(
        `${this.baseUrl}/items/${collection}/${id}`,
        payload,
        { headers: this.toHeaders(options) }
      ),
      options
    ).pipe(timeout(60000));
  }

  deleteItem(
    collection: string,
    id: string | number,
    options: DirectusRequestOptions = {}
  ): Observable<void> {
    return this.withAuthRetry(
      () => this.http.delete<void>(
        `${this.baseUrl}/items/${collection}/${id}`,
        { headers: this.toHeaders(options) }
      ),
      options
    );
  }

  uploadFile(
    file: File,
    title?: string,
    options: DirectusRequestOptions = {}
  ): Observable<DirectusFileResponse> {
    const formData = new FormData();
    if (title) {
      formData.append('title', title);
    }
    formData.append('file', file, file.name);

    return this.withAuthRetry(
      () => this.http.post<DirectusFileResponse>(
        `${this.baseUrl}/files`,
        formData,
        { headers: this.toHeaders(options) }
      ),
      options
    ).pipe(timeout(5 * 60 * 1000));
  }

  assetUrl(fileId: string): string {
    return `${this.baseUrl}/assets/${fileId}`;
  }

  private toParams(query: Record<string, DirectusQueryValue>): HttpParams {
    return Object.entries(query).reduce(
      (params, [key, value]) => params.set(key, String(value)),
      new HttpParams()
    );
  }

  private toHeaders(options: DirectusRequestOptions): HttpHeaders | undefined {
    if (!options.auth) {
      return undefined;
    }

    const token = getStoredDirectusAccessToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }

  private withAuthRetry<T>(
    request: () => Observable<T>,
    options: DirectusRequestOptions
  ): Observable<T> {
    if (!options.auth) {
      return request();
    }

    if (
      getStoredDirectusRefreshToken() &&
      isStoredDirectusAccessExpired()
    ) {
      return this.refreshSession().pipe(switchMap(() => request()));
    }

    return request().pipe(
      catchError((error) => {
        if (!this.isAuthError(error)) {
          return throwError(() => error);
        }

        return this.refreshSession().pipe(
          switchMap(() => request())
        );
      })
    );
  }

  private isAuthError(error: any): boolean {
    return error?.status === 401;
  }
}
