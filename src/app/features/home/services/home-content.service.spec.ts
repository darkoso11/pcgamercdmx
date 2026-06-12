import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  DEFAULT_HOME_CONTENT_SETTINGS,
  HomeContentService,
} from './home-content.service';

describe('HomeContentService', () => {
  let service: HomeContentService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeContentService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('exposes only active banners for the public home', async () => {
    service.saveSettings({
      ...DEFAULT_HOME_CONTENT_SETTINGS,
      banners: [
        { ...DEFAULT_HOME_CONTENT_SETTINGS.banners[0], active: false },
        { ...DEFAULT_HOME_CONTENT_SETTINGS.banners[1], active: true },
      ],
    });

    const banners = await firstValueFrom(service.getActiveBanners());

    expect(banners.length).toBe(1);
    expect(banners[0].id).toBe(DEFAULT_HOME_CONTENT_SETTINGS.banners[1].id);
  });

  it('keeps hero carousel banners editable separately from promo banners', async () => {
    service.saveSettings({
      ...DEFAULT_HOME_CONTENT_SETTINGS,
      heroBanners: [
        { ...DEFAULT_HOME_CONTENT_SETTINGS.heroBanners[0], active: false },
        {
          id: 'hero-custom',
          src: 'assets/img/gabinetes/custom-hero.png',
          link: '/ensambles',
          alt: 'Hero custom',
          active: true,
          sortOrder: 2,
        },
      ],
    });

    const heroBanners = await firstValueFrom(service.getActiveHeroBanners());
    const promoBanners = await firstValueFrom(service.getActiveBanners());

    expect(heroBanners.length).toBe(1);
    expect(heroBanners[0].id).toBe('hero-custom');
    expect(promoBanners.length).toBe(DEFAULT_HOME_CONTENT_SETTINGS.banners.length);
  });

  it('persists the events visibility switch and editable event data', async () => {
    service.saveSettings({
      ...DEFAULT_HOME_CONTENT_SETTINGS,
      showUpcomingEvents: false,
      events: [
        {
          id: 'lan-party',
          day: '18',
          month: 'AGO',
          title: 'LAN Party',
          description: 'Noche de pruebas y upgrades',
          link: '/contacto',
          ctaText: 'Reservar lugar',
          active: true,
        },
      ],
    });

    const settings = await firstValueFrom(service.getSettings());
    const events = await firstValueFrom(service.getActiveEvents());

    expect(settings.showUpcomingEvents).toBeFalse();
    expect(events.length).toBe(1);
    expect(events[0].title).toBe('LAN Party');
  });
});
