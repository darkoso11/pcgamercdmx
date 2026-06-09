import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CommunityCollaborator,
  CommunityPageSettings,
  DEFAULT_COMMUNITY_SETTINGS,
} from './collaborators.data';
import { CommunityService } from './community.service';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './community.component.html',
})
export class CommunityComponent implements OnInit {
  collaborators: CommunityCollaborator[] = [];
  settings: CommunityPageSettings = DEFAULT_COMMUNITY_SETTINGS;

  constructor(
    private readonly community: CommunityService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.community.getSettings().subscribe((settings) => {
      this.settings = settings;
      this.cdr.detectChanges();
    });

    this.community.getCollaborators().subscribe((collaborators) => {
      this.collaborators = collaborators;
      this.cdr.detectChanges();
    });
  }
}
