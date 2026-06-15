import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BUSINESS_INFO } from '../../../shared/config/business-info';
import { CommunityCollaborator } from '../../community/collaborators.data';
import { HomeEvent } from '../services/home-content.service';

@Component({
  selector: 'app-home-community-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-community-section.component.html',
})
export class HomeCommunitySectionComponent {
  readonly business = BUSINESS_INFO;
  @Input({ required: true }) influencers: CommunityCollaborator[] = [];
  @Input() showUpcomingEvents = true;
  @Input() events: HomeEvent[] = [];
}
