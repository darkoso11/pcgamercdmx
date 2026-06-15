import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class AdminCommunityComponent implements OnInit {
  collaborators: CommunityCollaborator[] = [];
  settings: CommunityPageSettings = { ...DEFAULT_COMMUNITY_SETTINGS };
  editor: CommunityCollaborator = { ...emptyCollaborator };
  editingId: string | null = null;
  activeTab: 'profiles' | 'page' = 'profiles';

  constructor(
    private readonly community: CommunityService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.community.getCollaborators(true).subscribe((collaborators) => {
      this.collaborators = collaborators;
      this.editor.sortOrder = collaborators.length + 1;
      this.cdr.detectChanges();
    });

    this.community.getSettings().subscribe((settings) => {
      this.settings = { ...settings };
      this.cdr.detectChanges();
    });
  }

  edit(collaborator: CommunityCollaborator): void {
    this.editingId = collaborator.id;
    this.editor = { ...collaborator };
    this.activeTab = 'profiles';
  }

  newProfile(): void {
    this.editingId = null;
    this.editor = {
      ...emptyCollaborator,
      id: '',
      sortOrder: this.collaborators.length + 1,
    };
    this.activeTab = 'profiles';
  }

  saveProfile(): void {
    if (!this.editor.name.trim() || !this.editor.image.trim()) {
      return;
    }

    this.community.saveCollaborator(this.editor).subscribe(() => this.newProfile());
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
    if (!confirm('Restaurar los colaboradores base y textos originales?')) {
      return;
    }

    this.community.reset();
    this.newProfile();
  }
}
