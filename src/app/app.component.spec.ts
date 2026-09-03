import { ActivatedRoute, Event, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AnalyticsService, SeoService } from './core/services/seo.service';
import { AppComponent } from './app.component';

describe('AppComponent SEO navigation lifecycle', () => {
  it('clears page JSON-LD at navigation start and updates route metadata at navigation end', () => {
    const events = new Subject<Event>();
    const router = {
      url: '/',
      events,
    };
    const activatedRoute = {
      snapshot: { data: {}, title: 'Inicio' },
      firstChild: null,
    };
    const seo = {
      update: jasmine.createSpy('update'),
      clearPageStructuredData: jasmine.createSpy('clearPageStructuredData'),
    };
    const analytics = { init: jasmine.createSpy('init') };
    const component = new AppComponent(
      router as unknown as Router,
      activatedRoute as unknown as ActivatedRoute,
      seo as unknown as SeoService,
      analytics as unknown as AnalyticsService
    );

    component.ngOnInit();
    events.next(new NavigationStart(1, '/pc-gamer-gama-alta-cdmx'));
    router.url = '/pc-gamer-gama-alta-cdmx';
    events.next(new NavigationEnd(
      1,
      '/pc-gamer-gama-alta-cdmx',
      '/pc-gamer-gama-alta-cdmx'
    ));

    expect(seo.clearPageStructuredData).toHaveBeenCalledTimes(1);
    expect(seo.update).toHaveBeenCalledTimes(2);
    component.ngOnDestroy();
  });
});
