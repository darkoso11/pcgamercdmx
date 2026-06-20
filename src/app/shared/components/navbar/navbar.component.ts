import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { BUSINESS_INFO } from '../../config/business-info';
import { isAdminUrl } from '../../../features/admin/admin-route.config';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  showNavbar = true;
  readonly business = BUSINESS_INFO;
  private sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateVisibility(this.router.url);
    this.sub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.updateVisibility(ev.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  private updateVisibility(url: string) {
    this.showNavbar = !isAdminUrl(url);
  }
}

