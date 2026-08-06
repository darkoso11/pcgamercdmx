import {
  clearStoredDirectusSession,
  DIRECTUS_ACCESS_TOKEN_KEY,
  DIRECTUS_ACCESS_EXPIRES_AT_KEY,
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

  it('does not break login when persistent storage rejects writes', () => {
    spyOn(localStorage, 'setItem').and.throwError(
      new DOMException('Storage is blocked', 'SecurityError')
    );

    expect(() => setStoredDirectusSession('access-token')).not.toThrow();
  });

  it('treats a storage read rejection as an unavailable session', () => {
    spyOn(localStorage, 'getItem').and.throwError(
      new DOMException('Storage is blocked', 'SecurityError')
    );
    spyOn(sessionStorage, 'getItem').and.throwError(
      new DOMException('Storage is blocked', 'SecurityError')
    );

    expect(getStoredDirectusAccessToken()).toBeNull();
  });

  it('does not break logout when storage rejects removals', () => {
    spyOn(localStorage, 'removeItem').and.throwError(
      new DOMException('Storage is blocked', 'SecurityError')
    );
    spyOn(sessionStorage, 'removeItem').and.throwError(
      new DOMException('Storage is blocked', 'SecurityError')
    );

    expect(() => clearStoredDirectusSession()).not.toThrow();
  });

  it('rolls back a session when required metadata cannot be stored', () => {
    const nativeSetItem = Storage.prototype.setItem;
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      if (key === DIRECTUS_ACCESS_EXPIRES_AT_KEY) {
        throw new DOMException('Storage quota exceeded', 'QuotaExceededError');
      }
      nativeSetItem.call(localStorage, key, value);
    });

    setStoredDirectusSession('access-token', 'refresh-token', 'admin@example.test', {
      persistence: 'local',
      accessExpiresAt: Date.now() + 60_000,
    });

    expect(localStorage.getItem(DIRECTUS_ACCESS_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(DIRECTUS_REFRESH_TOKEN_KEY)).toBeNull();
  });
});
