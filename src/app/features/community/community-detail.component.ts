import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import {
  CommunityCollaborator,
  CommunityPageSettings,
  DEFAULT_COMMUNITY_SETTINGS,
} from './collaborators.data';
import { CommunityService } from './community.service';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './community-detail.component.html',
})
export class CommunityDetailComponent implements OnInit {
  collaborator?: CommunityCollaborator;
  settings: CommunityPageSettings = DEFAULT_COMMUNITY_SETTINGS;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly community: CommunityService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.community.getSettings().subscribe((settings) => {
      this.settings = settings;
      this.cdr.detectChanges();
    });

    this.route.paramMap
      .pipe(switchMap((params) => this.community.getCollaboratorBySlug(params.get('slug') || '')))
      .subscribe((collaborator) => {
        this.collaborator = collaborator;
        this.cdr.detectChanges();
      });
  }
}
