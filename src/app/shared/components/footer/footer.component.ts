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
    hoverColor: string;
  }[] =
  [
    {
      href: BUSINESS_INFO.social.facebook,
      icon: 'fab fa-facebook-f',
      hoverColor: 'bg-cyan'
    },
    {
      href: BUSINESS_INFO.social.instagram,
      icon: 'fab fa-instagram',
      hoverColor: 'bg-pink'
    },
    {
      href: BUSINESS_INFO.social.discord,
      icon: 'fab fa-discord',
      hoverColor: 'bg-indigo'
    },
    {
      href: BUSINESS_INFO.social.youtube,
      icon: 'fab fa-youtube',
      hoverColor: 'bg-red'
    },
  ];
  year: number = new Date().getFullYear();
}

