import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DirectusApiService } from '../../../core/services/directus-api.service';
import { environment } from '../../../../environments/environment';

export interface EditorDraft {
  raw: Record<string, any>;
  baseVersion?: string;
  cover?: File | null;
  images: (File | null)[][];
  videos: (File | null)[];
}

export interface StoredEditorDraft {
  key: string;
  schema: 1;
  token: string;
  savedAt: string;
  draft: EditorDraft;
}

export class DraftConflictError extends Error {
  constructor() { super('La copia local cambió en otra pestaña. Recarga para elegir qué copia conservar.'); }
}

@Injectable({ providedIn: 'root' })
export class BlogDraftStore {
  constructor(private readonly directus: DirectusApiService) {}

  async scope(articleId?: string): Promise<string> {
    const profile = await firstValueFrom(this.directus.readSystem<{ data: { id: string } }>('users/me', { fields: 'id' }));
    if (!profile.data?.id) throw new Error('No se pudo identificar al usuario del borrador');
    return JSON.stringify([environment.directus.url, profile.data.id, articleId || 'new']);
  }

  async read(key: string): Promise<StoredEditorDraft | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readonly');
      const request = tx.objectStore('drafts').get(key);
      tx.oncomplete = () => {
        db.close();
        const record = request.result as StoredEditorDraft | undefined;
        if (record && (record.schema !== 1 || !Array.isArray(record.draft?.raw?.['sections']))) {
          reject(new Error('La copia local tiene un formato incompatible; no se ha eliminado.'));
        } else resolve(record);
      };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  }

  async write(key: string, draft: EditorDraft, expectedToken?: string): Promise<StoredEditorDraft> {
    const record: StoredEditorDraft = { key, schema: 1, draft, token: crypto.randomUUID(), savedAt: new Date().toISOString() };
    await this.mutate(key, expectedToken, record);
    return record;
  }

  async remove(key: string, expectedToken?: string): Promise<void> {
    await this.mutate(key, expectedToken);
  }

  private async mutate(key: string, expectedToken?: string, record?: StoredEditorDraft): Promise<void> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('drafts', 'readwrite');
      const store = tx.objectStore('drafts');
      let failure: Error | undefined;
      const request = store.get(key);
      request.onsuccess = () => {
        if (request.result?.token !== expectedToken) {
          failure = new DraftConflictError();
          tx.abort();
          return;
        }
        if (record) store.put(record);
        else store.delete(key);
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onabort = tx.onerror = () => { db.close(); reject(failure || tx.error || new Error('No se pudo guardar la copia local')); };
    });
  }

  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') { reject(new Error('El navegador no permite almacenamiento de borradores')); return; }
      const request = indexedDB.open('pcg-blog-editor', 1);
      request.onupgradeneeded = () => request.result.createObjectStore('drafts', { keyPath: 'key' });
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cierra otras pestañas para habilitar la recuperación local'));
      request.onsuccess = () => { request.result.onversionchange = () => request.result.close(); resolve(request.result); };
    });
  }
}
