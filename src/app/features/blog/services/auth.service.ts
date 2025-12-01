import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = '/api/blog';
  private storageKey = 'blog_admin_token';
  constructor(private http: HttpClient) {}

  login(password: string) {
    return this.http.post<{ token: string }>(`${this.base}/login`, { password }).pipe(
      tap(r => {
        if (r?.token) localStorage.setItem(this.storageKey, r.token);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.storageKey);
  }

  get token(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  // helper for dev or programmatic token set
  setToken(token: string) {
    localStorage.setItem(this.storageKey, token);
  }
}
