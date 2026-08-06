import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DirectusApiService } from '../../../core/services/directus-api.service';
import {
  clearStoredDirectusSession,
  DirectusSessionStorageOptions,
  getStoredDirectusAccessToken,
  setStoredDirectusSession,
} from '../../../core/services/directus-auth.storage';

export type AdminSessionDuration = 'tab' | '8h' | '7d' | 'manual';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private directus: DirectusApiService) {}

  login(
    email: string,
    password: string,
    sessionDuration: AdminSessionDuration = 'manual'
  ) {
    return this.directus.login(email, password).pipe(
      tap(r => {
        if (r?.data?.access_token) {
          const now = Date.now();
          setStoredDirectusSession(
            r.data.access_token,
            r.data.refresh_token,
            email,
            this.sessionStorageOptions(
              sessionDuration,
              now,
              r.data.expires
            )
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

  private sessionStorageOptions(
    duration: AdminSessionDuration,
    now: number,
    accessTokenTtl: number
  ): DirectusSessionStorageOptions {
    const accessExpiresAt = now + accessTokenTtl;

    if (duration === 'tab') {
      return { persistence: 'tab', accessExpiresAt };
    }

    const durationMs = duration === '8h'
      ? 8 * 60 * 60 * 1000
      : duration === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : undefined;

    return {
      persistence: 'local',
      accessExpiresAt,
      ...(durationMs ? { sessionExpiresAt: now + durationMs } : {}),
    };
  }
}
