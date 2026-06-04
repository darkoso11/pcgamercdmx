import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  showFooter = signal(true);
  private sub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateFooterVisibility(this.router.url);
    this.sub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.updateFooterVisibility(ev.urlAfterRedirects);
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private updateFooterVisibility(url: string) {
    this.showFooter.set(!url.startsWith('/admin'));
  }
}
