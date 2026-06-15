export const DIRECTUS_ACCESS_TOKEN_KEY = 'pcgamercdmx_directus_access_token';
export const DIRECTUS_REFRESH_TOKEN_KEY = 'pcgamercdmx_directus_refresh_token';
export const DIRECTUS_ADMIN_EMAIL_KEY = 'pcgamercdmx_directus_admin_email';

export function getStoredDirectusAccessToken(): string | null {
  return getStorageValue(DIRECTUS_ACCESS_TOKEN_KEY);
}

export function setStoredDirectusSession(
  accessToken: string,
  refreshToken?: string,
  email?: string
): void {
  setStorageValue(DIRECTUS_ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    setStorageValue(DIRECTUS_REFRESH_TOKEN_KEY, refreshToken);
  }

  if (email) {
    setStorageValue(DIRECTUS_ADMIN_EMAIL_KEY, email);
  }
}

export function clearStoredDirectusSession(): void {
  removeStorageValue(DIRECTUS_ACCESS_TOKEN_KEY);
  removeStorageValue(DIRECTUS_REFRESH_TOKEN_KEY);
  removeStorageValue(DIRECTUS_ADMIN_EMAIL_KEY);
}

function getStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function getStorageValue(key: string): string | null {
  return getStorage()?.getItem(key) ?? null;
}

function setStorageValue(key: string, value: string): void {
  getStorage()?.setItem(key, value);
}

function removeStorageValue(key: string): void {
  getStorage()?.removeItem(key);
}
