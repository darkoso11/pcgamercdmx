import { of } from 'rxjs';
import { BlogDraftStore, DraftConflictError, EditorDraft } from './blog-draft.store';

describe('BlogDraftStore IndexedDB recovery', () => {
  let store: BlogDraftStore;
  let key: string;
  const draft = (): EditorDraft => ({ raw: { title: 'Sin terminar', sections: [] }, images: [], videos: [] });

  beforeEach(() => {
    store = new BlogDraftStore({ readSystem: () => of({ data: { id: 'editor-1' } }) } as any);
    key = 'spec-' + crypto.randomUUID();
  });

  afterEach(async () => {
    const saved = await store.read(key);
    if (saved) await store.remove(key, saved.token);
  });

  it('persists incomplete data and actual files across store instances', async () => {
    const value = draft();
    value.cover = new File(['pending bytes'], 'cover.png', { type: 'image/png' });
    const written = await store.write(key, value);
    const reloaded = await new BlogDraftStore({} as any).read(key);
    expect(reloaded?.token).toBe(written.token);
    expect(reloaded?.draft.raw['title']).toBe('Sin terminar');
    expect(reloaded?.draft.cover?.name).toBe('cover.png');
    expect(await reloaded!.draft.cover!.text()).toBe('pending bytes');
  });

  it('rejects concurrent writes and deletions instead of discarding another tab', async () => {
    const first = await store.write(key, draft());
    const second = await store.write(key, { ...draft(), raw: { title: 'Otra pestaña', sections: [] } }, first.token);
    await expectAsync(store.write(key, draft(), first.token)).toBeRejectedWithError(DraftConflictError);
    await expectAsync(store.remove(key, first.token)).toBeRejectedWithError(DraftConflictError);
    expect((await store.read(key))?.token).toBe(second.token);
  });

  it('isolates users and article keys without storing access tokens', async () => {
    const user1 = await store.scope('1');
    const user2 = await new BlogDraftStore({ readSystem: () => of({ data: { id: 'editor-2' } }) } as any).scope('1');
    expect(user1).not.toBe(user2);
    expect(user1).not.toBe(await store.scope('2'));
    expect(user1).not.toBe(await store.scope());
    await store.write(key, draft());
    expect(await store.read(key + '-other')).toBeUndefined();
  });

  it('does not use a shared anonymous scope when the authenticated profile is missing', async () => {
    const anonymous = new BlogDraftStore({ readSystem: () => of({ data: {} }) } as any);
    await expectAsync(anonymous.scope('1')).toBeRejectedWithError('No se pudo identificar al usuario del borrador');
  });
});
