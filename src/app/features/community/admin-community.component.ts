import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, defer, finalize, map, of, switchMap, takeUntil } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminHeaderComponent } from '../admin/admin-header.component';
import {
  CommunityCollaborator,
  CommunityPageSettings,
  DEFAULT_COMMUNITY_SETTINGS,
} from './collaborators.data';
import { CommunityService } from './community.service';

const emptyCollaborator: CommunityCollaborator = {
  id: '',
  slug: '',
  name: '',
  image: '',
  role: 'Colaborador / Influencer',
  bio: '',
  instagram: '',
  twitch: '',
  featured: false,
  published: true,
  sortOrder: 999,
};

@Component({
  selector: 'app-admin-community',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-community.component.html',
})
export class AdminCommunityComponent implements OnInit, OnDestroy {
  selectedPhoto: File | null = null;
  photoPreview = '';
  photoError = '';
  saving = false;
  private readonly destroy$ = new Subject<void>();
  collaborators: CommunityCollaborator[] = [];
  settings: CommunityPageSettings = { ...DEFAULT_COMMUNITY_SETTINGS };
  editor: CommunityCollaborator = { ...emptyCollaborator };
  editingId: string | null = null;
  activeTab: 'profiles' | 'page' = 'profiles';

  constructor(
    private readonly community: CommunityService,
    private readonly cdr: ChangeDetectorRef,
    private readonly directus: DirectusApiService
  ) {}

  ngOnInit(): void {
    this.community.getCollaborators(true).pipe(takeUntil(this.destroy$)).subscribe((collaborators) => {
      this.collaborators = collaborators;
      this.editor.sortOrder = collaborators.length + 1;
      this.cdr.detectChanges();
    });

    this.community.getSettings().pipe(takeUntil(this.destroy$)).subscribe((settings) => {
      this.settings = { ...settings };
      this.cdr.detectChanges();
    });
  }

  edit(collaborator: CommunityCollaborator): void {
    if (this.saving) return;
    this.clearPhoto();
    this.editingId = collaborator.id;
    this.editor = { ...collaborator };
    this.activeTab = 'profiles';
  }

  newProfile(): void {
    if (this.saving) return;
    this.clearPhoto();
    this.editingId = null;
    this.editor = {
      ...emptyCollaborator,
      id: '',
      sortOrder: this.collaborators.length + 1,
    };
    this.activeTab = 'profiles';
  }

  saveProfile(): void {
    if (this.saving) return;
    if (!this.editor.name.trim() || (!this.selectedPhoto && !this.editor.image.trim())) {
      this.photoError = 'Agrega un nombre y una foto o URL de imagen.';
      return;
    }

    this.saving = true;
    this.photoError = '';
    const draft = { ...this.editor };
    const file = this.selectedPhoto;
    const image$ = file
      ? this.directus.uploadFile(file, file.name, { auth: true }).pipe(map(response => this.directus.assetUrl(response.data.id)))
      : of(draft.image);
    image$.pipe(
      switchMap(image => defer(() => this.community.saveCollaborator({ ...draft, image }))),
      finalize(() => { this.saving = false; this.cdr.detectChanges(); }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => { this.saving = false; this.newProfile(); },
      error: () => { this.photoError = 'No se pudo guardar el perfil o subir la foto. Revisa tu conexión y acceso a Directus e inténtalo de nuevo.'; },
    });
  }

  selectPhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.saving) return;
    this.photoError = '';
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) {
      this.photoError = 'Usa una imagen JPG, PNG, WebP o GIF de hasta 5 MB.';
      return;
    }
    this.clearPhoto();
    this.selectedPhoto = file;
    this.photoPreview = URL.createObjectURL(file);
  }

  clearPhoto(): void {
    if (this.photoPreview) URL.revokeObjectURL(this.photoPreview);
    this.selectedPhoto = null;
    this.photoPreview = '';
    this.photoError = '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearPhoto();
  }

  deleteProfile(id: string): void {
    if (!confirm('Eliminar este colaborador?')) {
      return;
    }

    this.community.deleteCollaborator(id).subscribe(() => {
      if (this.editingId === id) {
        this.newProfile();
      }
    });
  }

  saveSettings(): void {
    this.community.saveSettings(this.settings).subscribe((settings) => {
      this.settings = { ...settings };
      this.cdr.detectChanges();
    });
  }

  resetSeed(): void {
    if (this.saving) return;
    if (!confirm('Restaurar los colaboradores base y textos originales?')) {
      return;
    }

    this.community.reset();
    this.newProfile();
  }
}
