import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import {
  CommunityCollaborator,
  CommunityPageSettings,
  DEFAULT_COLLABORATORS,
  DEFAULT_COMMUNITY_SETTINGS,
} from './collaborators.data';

const collaboratorsKey = 'pcgamer.community.collaborators';
const settingsKey = 'pcgamer.community.settings';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private readonly collaboratorsSubject = new BehaviorSubject<CommunityCollaborator[]>(
    this.loadCollaborators()
  );
  private readonly settingsSubject = new BehaviorSubject<CommunityPageSettings>(
    this.loadSettings()
  );

  getCollaborators(includeDrafts = false): Observable<CommunityCollaborator[]> {
    return this.collaboratorsSubject.asObservable().pipe(
      map((items) =>
        this.sort(items).filter((item) => includeDrafts || item.published)
      )
    );
  }

  getFeaturedCollaborators(limit = 8): Observable<CommunityCollaborator[]> {
    return this.getCollaborators().pipe(
      map((items) =>
        items
          .filter((item) => item.featured)
          .concat(items.filter((item) => !item.featured))
          .slice(0, limit)
      )
    );
  }

  getCollaboratorBySlug(slug: string): Observable<CommunityCollaborator | undefined> {
    return this.getCollaborators().pipe(
      map((items) => items.find((item) => item.slug === slug))
    );
  }

  getSettings(): Observable<CommunityPageSettings> {
    return this.settingsSubject.asObservable();
  }

  saveCollaborator(collaborator: CommunityCollaborator): Observable<CommunityCollaborator> {
    const current = this.collaboratorsSubject.value;
    const normalized = this.normalizeCollaborator(collaborator, current);
    const exists = current.some((item) => item.id === normalized.id);
    const next = exists
      ? current.map((item) => (item.id === normalized.id ? normalized : item))
      : [...current, normalized];

    this.persistCollaborators(next);
    return of(normalized);
  }

  deleteCollaborator(id: string): Observable<void> {
    this.persistCollaborators(
      this.collaboratorsSubject.value.filter((item) => item.id !== id)
    );
    return of(undefined);
  }

  saveSettings(settings: CommunityPageSettings): Observable<CommunityPageSettings> {
    const next = {
      ...DEFAULT_COMMUNITY_SETTINGS,
      ...settings,
    };
    this.settingsSubject.next(next);
    this.writeStorage(settingsKey, next);
    return of(next);
  }

  reset(): void {
    this.writeStorage(collaboratorsKey, DEFAULT_COLLABORATORS);
    this.writeStorage(settingsKey, DEFAULT_COMMUNITY_SETTINGS);
    this.collaboratorsSubject.next(DEFAULT_COLLABORATORS);
    this.settingsSubject.next(DEFAULT_COMMUNITY_SETTINGS);
  }

  private normalizeCollaborator(
    collaborator: CommunityCollaborator,
    current: CommunityCollaborator[]
  ): CommunityCollaborator {
    const baseSlug = this.slugify(collaborator.slug || collaborator.name);
    const usedSlugs = new Set(
      current
        .filter((item) => item.id !== collaborator.id)
        .map((item) => item.slug)
    );
    const slug = this.uniqueSlug(baseSlug, usedSlugs);

    return {
      ...collaborator,
      id: collaborator.id || slug,
      slug,
      image: collaborator.image.trim(),
      name: collaborator.name.trim(),
      role: collaborator.role.trim() || 'Colaborador / Influencer',
      bio: collaborator.bio.trim(),
      sortOrder: Number(collaborator.sortOrder) || current.length + 1,
    };
  }

  private sort(items: CommunityCollaborator[]): CommunityCollaborator[] {
    return [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  private uniqueSlug(slug: string, usedSlugs: Set<string>): string {
    let candidate = slug;
    let index = 2;

    while (usedSlugs.has(candidate)) {
      candidate = `${slug}-${index}`;
      index += 1;
    }

    return candidate;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'colaborador';
  }

  private loadCollaborators(): CommunityCollaborator[] {
    return this.readStorage<CommunityCollaborator[]>(collaboratorsKey) ?? DEFAULT_COLLABORATORS;
  }

  private loadSettings(): CommunityPageSettings {
    return {
      ...DEFAULT_COMMUNITY_SETTINGS,
      ...(this.readStorage<CommunityPageSettings>(settingsKey) ?? {}),
    };
  }

  private persistCollaborators(items: CommunityCollaborator[]): void {
    const sorted = this.sort(items);
    this.collaboratorsSubject.next(sorted);
    this.writeStorage(collaboratorsKey, sorted);
  }

  private readStorage<T>(key: string): T | null {
    try {
      return typeof localStorage === 'undefined'
        ? null
        : JSON.parse(localStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  }

  private writeStorage(key: string, value: unknown): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Local storage can fail in private browsing; keep in-memory state active.
    }
  }
}
