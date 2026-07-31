import {
  clearStoredDirectusSession,
  DIRECTUS_ACCESS_TOKEN_KEY,
  DIRECTUS_REFRESH_TOKEN_KEY,
  getStoredDirectusAccessToken,
  setStoredDirectusSession,
} from './directus-auth.storage';

describe('Directus auth storage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearStoredDirectusSession();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps a tab-only session out of persistent storage', () => {
    (setStoredDirectusSession as any)(
      'tab-access',
      'tab-refresh',
      'admin@example.test',
      { persistence: 'tab' }
    );

    expect(localStorage.getItem(DIRECTUS_ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(DIRECTUS_REFRESH_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(DIRECTUS_ACCESS_TOKEN_KEY)).toBe('tab-access');
    expect(sessionStorage.getItem(DIRECTUS_REFRESH_TOKEN_KEY)).toBe('tab-refresh');
    expect(getStoredDirectusAccessToken()).toBe('tab-access');
  });

  it('clears a session after its chosen deadline', () => {
    (setStoredDirectusSession as any)(
      'expired-access',
      'expired-refresh',
      'admin@example.test',
      { persistence: 'local', sessionExpiresAt: Date.now() - 1 }
    );

    expect(getStoredDirectusAccessToken()).toBeNull();
    expect(localStorage.getItem(DIRECTUS_REFRESH_TOKEN_KEY)).toBeNull();
  });
});
