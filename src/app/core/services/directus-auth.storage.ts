export const DIRECTUS_ACCESS_TOKEN_KEY = 'pcgamercdmx_directus_access_token';
export const DIRECTUS_REFRESH_TOKEN_KEY = 'pcgamercdmx_directus_refresh_token';
export const DIRECTUS_ADMIN_EMAIL_KEY = 'pcgamercdmx_directus_admin_email';
export const DIRECTUS_ACCESS_EXPIRES_AT_KEY = 'pcgamercdmx_directus_access_expires_at';
export const DIRECTUS_SESSION_EXPIRES_AT_KEY = 'pcgamercdmx_directus_session_expires_at';

export type DirectusSessionPersistence = 'tab' | 'local';

export interface DirectusSessionStorageOptions {
  persistence: DirectusSessionPersistence;
  accessExpiresAt?: number;
  sessionExpiresAt?: number;
}

export function getStoredDirectusAccessToken(): string | null {
  return getSessionValue(DIRECTUS_ACCESS_TOKEN_KEY);
}

export function getStoredDirectusRefreshToken(): string | null {
  return getSessionValue(DIRECTUS_REFRESH_TOKEN_KEY);
}

export function isStoredDirectusAccessExpired(
  now = Date.now(),
  skewMs = 30_000
): boolean {
  const storage = getActiveStorage();
  const expiresAt = Number(storage?.getItem(DIRECTUS_ACCESS_EXPIRES_AT_KEY) || 0);
  return Boolean(expiresAt && expiresAt <= now + skewMs);
}

export function setStoredDirectusSession(
  accessToken: string,
  refreshToken?: string,
  email?: string,
  options?: DirectusSessionStorageOptions
): void {
  const storage = options
    ? getStorage(options.persistence)
    : getActiveStorage() ?? getStorage('local');

  if (!storage) {
    return;
  }

  if (options) {
    clearStoredDirectusSession();
  }

  storage.setItem(DIRECTUS_ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    storage.setItem(DIRECTUS_REFRESH_TOKEN_KEY, refreshToken);
  }

  if (email) {
    storage.setItem(DIRECTUS_ADMIN_EMAIL_KEY, email);
  }

  if (options?.accessExpiresAt) {
    storage.setItem(
      DIRECTUS_ACCESS_EXPIRES_AT_KEY,
      String(options.accessExpiresAt)
    );
  }

  if (options?.sessionExpiresAt) {
    storage.setItem(
      DIRECTUS_SESSION_EXPIRES_AT_KEY,
      String(options.sessionExpiresAt)
    );
  }
}

export function updateStoredDirectusAccessExpiry(accessExpiresAt: number): void {
  getActiveStorage()?.setItem(
    DIRECTUS_ACCESS_EXPIRES_AT_KEY,
    String(accessExpiresAt)
  );
}

export function clearStoredDirectusSession(): void {
  for (const storage of [getStorage('local'), getStorage('tab')]) {
    storage?.removeItem(DIRECTUS_ACCESS_TOKEN_KEY);
    storage?.removeItem(DIRECTUS_REFRESH_TOKEN_KEY);
    storage?.removeItem(DIRECTUS_ADMIN_EMAIL_KEY);
    storage?.removeItem(DIRECTUS_ACCESS_EXPIRES_AT_KEY);
    storage?.removeItem(DIRECTUS_SESSION_EXPIRES_AT_KEY);
  }
}

function getSessionValue(key: string): string | null {
  const storage = getActiveStorage();
  if (!storage) {
    return null;
  }

  const sessionExpiresAt = Number(
    storage.getItem(DIRECTUS_SESSION_EXPIRES_AT_KEY) || 0
  );
  if (sessionExpiresAt && sessionExpiresAt <= Date.now()) {
    clearStoredDirectusSession();
    return null;
  }

  return storage.getItem(key);
}

function getActiveStorage(): Storage | null {
  const tabStorage = getStorage('tab');
  if (
    tabStorage?.getItem(DIRECTUS_ACCESS_TOKEN_KEY) ||
    tabStorage?.getItem(DIRECTUS_REFRESH_TOKEN_KEY)
  ) {
    return tabStorage;
  }

  const localStorage = getStorage('local');
  if (
    localStorage?.getItem(DIRECTUS_ACCESS_TOKEN_KEY) ||
    localStorage?.getItem(DIRECTUS_REFRESH_TOKEN_KEY)
  ) {
    return localStorage;
  }

  return null;
}

function getStorage(persistence: DirectusSessionPersistence): Storage | null {
  try {
    if (persistence === 'tab') {
      return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    }
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}
