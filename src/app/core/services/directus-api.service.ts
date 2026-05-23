import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type DirectusFeature = keyof typeof environment.directus.features;

export interface DirectusListResponse<T> {
  data: T[];
}

export interface DirectusItemResponse<T> {
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class DirectusApiService {
  private readonly baseUrl = environment.directus.url.replace(/\/+$/, '');

  constructor(private readonly http: HttpClient) {}

  isEnabled(feature?: DirectusFeature): boolean {
    if (!environment.directus.enabled) {
      return false;
    }

    return feature ? Boolean(environment.directus.features[feature]) : true;
  }

  readItems<T>(
    collection: string,
    query: Record<string, string | number | boolean> = {}
  ): Observable<DirectusListResponse<T>> {
    return this.http.get<DirectusListResponse<T>>(
      `${this.baseUrl}/items/${collection}`,
      { params: this.toParams(query) }
    );
  }

  createItem<T>(
    collection: string,
    payload: Record<string, unknown>
  ): Observable<DirectusItemResponse<T>> {
    return this.http.post<DirectusItemResponse<T>>(
      `${this.baseUrl}/items/${collection}`,
      payload
    );
  }

  private toParams(query: Record<string, string | number | boolean>): HttpParams {
    return Object.entries(query).reduce(
      (params, [key, value]) => params.set(key, String(value)),
      new HttpParams()
    );
  }
}
