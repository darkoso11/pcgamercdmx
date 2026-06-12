import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';

export interface HomeBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  ctaText: string;
  badgeText: string;
  active: boolean;
  sortOrder: number;
}

export interface HomeHeroBanner {
  id: string;
  src: string;
  link: string;
  alt: string;
  active: boolean;
  sortOrder: number;
}

export interface HomeEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  description: string;
  link: string;
  ctaText: string;
  active: boolean;
}

export interface HomeContentSettings {
  heroBanners: HomeHeroBanner[];
  banners: HomeBanner[];
  showUpcomingEvents: boolean;
  events: HomeEvent[];
}

const settingsKey = 'pcgamer.home.content';

export const DEFAULT_HOME_CONTENT_SETTINGS: HomeContentSettings = {
  showUpcomingEvents: true,
  heroBanners: [
    {
      id: 'hero-nzxt-h9',
      src: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png',
      link: '/ensambles',
      alt: 'Gabinete NZXT H9 Flow',
      active: true,
      sortOrder: 1,
    },
    {
      id: 'hero-hbjnkhgnm',
      src: 'assets/img/gabinetes/HBJNKHGNM.png',
      link: '/ensambles',
      alt: 'PC gamer con iluminacion RGB',
      active: true,
      sortOrder: 2,
    },
    {
      id: 'hero-product-section',
      src: 'assets/img/gabinetes/product-section-01.png',
      link: '/ensambles',
      alt: 'Gabinete gamer en showcase',
      active: true,
      sortOrder: 3,
    },
  ],
  banners: [
    {
      id: 'ensambles-personalizados',
      title: 'Ensambles Personalizados',
      description:
        'Construimos la PC de tus suenos con los mejores componentes y la maxima calidad.',
      imageUrl: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png',
      link: '/cotiza-tu-pc',
      ctaText: 'Personaliza tu PC',
      badgeText: 'POPULAR',
      active: true,
      sortOrder: 1,
    },
    {
      id: 'ofertas-especiales',
      title: 'Ofertas Especiales',
      description:
        'Aprovecha promociones exclusivas en productos seleccionados.',
      imageUrl: 'assets/img/gabinetes/product-section-01.png',
      link: '/productos',
      ctaText: 'Ver Ofertas',
      badgeText: 'OFERTA',
      active: true,
      sortOrder: 2,
    },
    {
      id: 'sorteos-mensuales',
      title: 'Sorteos Mensuales',
      description:
        'Participa en sorteos mensuales y gana componentes premium para tu setup.',
      imageUrl: 'assets/img/gabinetes/rog-hyperion-gr701.png',
      link: '/sorteos',
      ctaText: 'Participar Ahora',
      badgeText: 'SORTEO',
      active: true,
      sortOrder: 3,
    },
  ],
  events: [
    {
      id: 'torneo-valorant',
      day: '25',
      month: 'JUN',
      title: 'Torneo de Valorant',
      description: 'Compite con los mejores jugadores de CDMX.',
      link: '/contacto',
      ctaText: 'Mas informacion',
      active: true,
    },
    {
      id: 'stream-ensamble',
      day: '10',
      month: 'JUL',
      title: 'Stream de Ensamble en Vivo',
      description: 'Aprende a ensamblar tu PC con expertos.',
      link: '/contacto',
      ctaText: 'Agendar recordatorio',
      active: true,
    },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class HomeContentService {
  private readonly settingsSubject = new BehaviorSubject<HomeContentSettings>(
    this.loadSettings()
  );

  getSettings(): Observable<HomeContentSettings> {
    return this.settingsSubject.asObservable();
  }

  getActiveBanners(): Observable<HomeBanner[]> {
    return this.getSettings().pipe(
      map((settings) =>
        this.sortBanners(settings.banners).filter((banner) => banner.active)
      )
    );
  }

  getActiveHeroBanners(): Observable<HomeHeroBanner[]> {
    return this.getSettings().pipe(
      map((settings) =>
        this.sortHeroBanners(settings.heroBanners).filter((banner) => banner.active)
      )
    );
  }

  getActiveEvents(): Observable<HomeEvent[]> {
    return this.getSettings().pipe(
      map((settings) => settings.events.filter((event) => event.active))
    );
  }

  saveSettings(settings: HomeContentSettings): Observable<HomeContentSettings> {
    const next = this.normalizeSettings(settings);
    this.settingsSubject.next(next);
    this.writeStorage(next);
    return of(next);
  }

  reset(): void {
    this.settingsSubject.next(DEFAULT_HOME_CONTENT_SETTINGS);
    this.writeStorage(DEFAULT_HOME_CONTENT_SETTINGS);
  }

  private normalizeSettings(settings: HomeContentSettings): HomeContentSettings {
    return {
      ...DEFAULT_HOME_CONTENT_SETTINGS,
      ...settings,
      heroBanners: this.sortHeroBanners(
        settings.heroBanners ?? DEFAULT_HOME_CONTENT_SETTINGS.heroBanners
      ).map((banner, index) => ({
        ...banner,
        id: banner.id || this.slugify(banner.alt || `hero-banner-${index + 1}`),
        sortOrder: Number(banner.sortOrder) || index + 1,
      })),
      banners: this.sortBanners(settings.banners).map((banner, index) => ({
        ...banner,
        id: banner.id || this.slugify(banner.title || `banner-${index + 1}`),
        sortOrder: Number(banner.sortOrder) || index + 1,
      })),
      events: settings.events.map((event, index) => ({
        ...event,
        id: event.id || this.slugify(event.title || `evento-${index + 1}`),
      })),
    };
  }

  private sortBanners(banners: HomeBanner[]): HomeBanner[] {
    return [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private sortHeroBanners(banners: HomeHeroBanner[]): HomeHeroBanner[] {
    return [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  private loadSettings(): HomeContentSettings {
    return this.normalizeSettings(
      this.readStorage<HomeContentSettings>() ?? DEFAULT_HOME_CONTENT_SETTINGS
    );
  }

  private readStorage<T>(): T | null {
    try {
      return typeof localStorage === 'undefined'
        ? null
        : JSON.parse(localStorage.getItem(settingsKey) || 'null');
    } catch {
      return null;
    }
  }

  private writeStorage(value: HomeContentSettings): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(settingsKey, JSON.stringify(value));
      }
    } catch {
      // Local storage can fail; keep the in-memory settings active.
    }
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}
