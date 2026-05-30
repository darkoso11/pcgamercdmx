import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BUSINESS_INFO } from '../../config/business-info';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  readonly business = BUSINESS_INFO;
  public contacts: {
    href: string;
    icon: string;
    label: string;
  }[] =
  [
    {
      href: BUSINESS_INFO.social.facebook,
      icon: 'fab fa-facebook-f',
      label: 'Facebook',
    },
    {
      href: BUSINESS_INFO.social.instagram,
      icon: 'fab fa-instagram',
      label: 'Instagram',
    },
    {
      href: BUSINESS_INFO.social.tiktok,
      icon: 'fab fa-tiktok',
      label: 'TikTok',
    },
    {
      href: BUSINESS_INFO.social.discord,
      icon: 'fab fa-discord',
      label: 'Discord',
    },
    {
      href: BUSINESS_INFO.social.youtube,
      icon: 'fab fa-youtube',
      label: 'YouTube',
    },
    {
      href: BUSINESS_INFO.social.facebookGroup,
      icon: 'fas fa-users',
      label: 'Grupo de Facebook',
    },
  ];
  year: number = new Date().getFullYear();
}

