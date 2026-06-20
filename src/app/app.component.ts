import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AnalyticsService, SeoService } from './core/services/seo.service';
import { isAdminUrl } from './features/admin/admin-route.config';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showFooter = signal(true);
  private sub?: Subscription;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private seoService: SeoService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.init();
    this.updateFooterVisibility(this.router.url);
    this.updateSeo();
    this.sub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.updateFooterVisibility(ev.urlAfterRedirects);
        this.updateSeo();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateFooterVisibility(url: string) {
    this.showFooter.set(!isAdminUrl(url));
  }

  private updateSeo() {
    let route: ActivatedRoute | null = this.activatedRoute;
    let title: string | undefined;
    const data: Record<string, unknown> = {};

    while (route) {
      Object.assign(data, route.snapshot.data);
      title = route.snapshot.title ?? title;
      route = route.firstChild;
    }

    const url = this.router.url.split('?')[0] || '/';

    this.seoService.update({
      title,
      description: data['description'] as string | undefined,
      keywords: data['keywords'] as string | undefined,
      image: data['image'] as string | undefined,
      type: data['seoType'] as 'website' | 'article' | 'product' | undefined,
      noIndex: Boolean(data['noIndex']) || isAdminUrl(url),
      url,
    });
  }
}
