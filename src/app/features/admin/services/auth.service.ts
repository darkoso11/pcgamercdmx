import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DirectusApiService } from '../../../core/services/directus-api.service';
import {
  clearStoredDirectusSession,
  getStoredDirectusAccessToken,
  setStoredDirectusSession,
} from '../../../core/services/directus-auth.storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private directus: DirectusApiService) {}

  login(email: string, password: string) {
    return this.directus.login(email, password).pipe(
      tap(r => {
        if (r?.data?.access_token) {
          setStoredDirectusSession(
            r.data.access_token,
            r.data.refresh_token,
            email
          );
        }
      }),
      map(r => ({
        token: r.data.access_token,
        refreshToken: r.data.refresh_token,
        expires: r.data.expires,
      }))
    );
  }

  logout() {
    clearStoredDirectusSession();
  }

  get token(): string | null {
    return getStoredDirectusAccessToken();
  }

  // helper for dev or programmatic token set
  setToken(token: string, refreshToken?: string) {
    setStoredDirectusSession(token, refreshToken);
  }
}
