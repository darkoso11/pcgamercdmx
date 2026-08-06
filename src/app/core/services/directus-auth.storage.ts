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
  const expiresAt = Number(safeGetItem(storage, DIRECTUS_ACCESS_EXPIRES_AT_KEY) || 0);
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

  const sessionEntries: Array<[string, string]> = [
    [DIRECTUS_ACCESS_TOKEN_KEY, accessToken],
  ];
  if (refreshToken) {
    sessionEntries.push([DIRECTUS_REFRESH_TOKEN_KEY, refreshToken]);
  }
  if (email) {
    sessionEntries.push([DIRECTUS_ADMIN_EMAIL_KEY, email]);
  }
  if (options?.accessExpiresAt) {
    sessionEntries.push([
      DIRECTUS_ACCESS_EXPIRES_AT_KEY,
      String(options.accessExpiresAt),
    ]);
  }
  if (options?.sessionExpiresAt) {
    sessionEntries.push([
      DIRECTUS_SESSION_EXPIRES_AT_KEY,
      String(options.sessionExpiresAt),
    ]);
  }

  if (sessionEntries.some(([key, value]) => !safeSetItem(storage, key, value))) {
    clearStoredDirectusSession();
  }
}

export function updateStoredDirectusAccessExpiry(accessExpiresAt: number): void {
  safeSetItem(
    getActiveStorage(),
    DIRECTUS_ACCESS_EXPIRES_AT_KEY,
    String(accessExpiresAt)
  );
}

export function clearStoredDirectusSession(): void {
  for (const storage of [getStorage('local'), getStorage('tab')]) {
    safeRemoveItem(storage, DIRECTUS_ACCESS_TOKEN_KEY);
    safeRemoveItem(storage, DIRECTUS_REFRESH_TOKEN_KEY);
    safeRemoveItem(storage, DIRECTUS_ADMIN_EMAIL_KEY);
    safeRemoveItem(storage, DIRECTUS_ACCESS_EXPIRES_AT_KEY);
    safeRemoveItem(storage, DIRECTUS_SESSION_EXPIRES_AT_KEY);
  }
}

function getSessionValue(key: string): string | null {
  const storage = getActiveStorage();
  if (!storage) {
    return null;
  }

  const sessionExpiresAt = Number(
    safeGetItem(storage, DIRECTUS_SESSION_EXPIRES_AT_KEY) || 0
  );
  if (sessionExpiresAt && sessionExpiresAt <= Date.now()) {
    clearStoredDirectusSession();
    return null;
  }

  return safeGetItem(storage, key);
}

function getActiveStorage(): Storage | null {
  const tabStorage = getStorage('tab');
  if (
    safeGetItem(tabStorage, DIRECTUS_ACCESS_TOKEN_KEY) ||
    safeGetItem(tabStorage, DIRECTUS_REFRESH_TOKEN_KEY)
  ) {
    return tabStorage;
  }

  const localStorage = getStorage('local');
  if (
    safeGetItem(localStorage, DIRECTUS_ACCESS_TOKEN_KEY) ||
    safeGetItem(localStorage, DIRECTUS_REFRESH_TOKEN_KEY)
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

function safeGetItem(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSetItem(storage: Storage | null, key: string, value: string): boolean {
  try {
    storage?.setItem(key, value);
    return storage !== null;
  } catch {
    return false;
  }
}

function safeRemoveItem(storage: Storage | null, key: string): void {
  try {
    storage?.removeItem(key);
  } catch {
    // Storage can be exposed but blocked by privacy settings or browser policy.
  }
}
