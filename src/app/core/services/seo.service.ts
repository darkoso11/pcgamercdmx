import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { BUSINESS_INFO } from '../../shared/config/business-info';

export interface SeoConfig {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noIndex?: boolean;
}

const DEFAULT_SEO: Required<Omit<SeoConfig, 'noIndex'>> = {
  title: 'PC Gamer CDMX | Ensambles, componentes y PCs gamer en Ciudad de Mexico',
  description:
    'PC Gamer CDMX ensambla PCs gamer a medida, paquetes listos, perifericos, componentes y soporte tecnico especializado en Ciudad de Mexico.',
  keywords:
    'PC Gamer CDMX, pc gamer, ensambles pc, computadoras gamer, componentes pc, perifericos gamer, Ciudad de Mexico',
  image: '/assets/img/leon.png',
  url: 'https://pcgamercdmx.com/',
  type: 'website',
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private readonly titleService: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  update(config: SeoConfig = {}): void {
    const seo = {
      title: config.title ?? DEFAULT_SEO.title,
      description: config.description ?? DEFAULT_SEO.description,
      keywords: config.keywords ?? DEFAULT_SEO.keywords,
      image: config.image ?? DEFAULT_SEO.image,
      url: config.url ?? DEFAULT_SEO.url,
      type: config.type ?? DEFAULT_SEO.type,
    };
    const absoluteUrl = this.toAbsoluteUrl(seo.url);
    const absoluteImage = this.toAbsoluteUrl(seo.image);

    this.titleService.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'keywords', content: seo.keywords });
    this.meta.updateTag({ name: 'robots', content: config.noIndex ? 'noindex,nofollow' : 'index,follow' });
    this.meta.updateTag({ name: 'author', content: BUSINESS_INFO.name });
    this.meta.updateTag({ name: 'theme-color', content: '#0d1127' });

    this.meta.updateTag({ property: 'og:title', content: seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:type', content: seo.type });
    this.meta.updateTag({ property: 'og:url', content: absoluteUrl });
    this.meta.updateTag({ property: 'og:image', content: absoluteImage });
    this.meta.updateTag({ property: 'og:locale', content: 'es_MX' });
    this.meta.updateTag({ property: 'og:site_name', content: BUSINESS_INFO.name });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seo.title });
    this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    this.meta.updateTag({ name: 'twitter:image', content: absoluteImage });

    this.setCanonical(absoluteUrl);
    this.setStructuredData();
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setStructuredData(): void {
    const id = 'organization-schema';
    let script = this.document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ComputerStore',
      name: BUSINESS_INFO.name,
      url: DEFAULT_SEO.url,
      logo: this.toAbsoluteUrl('/assets/img/leon.png'),
      email: BUSINESS_INFO.email,
      telephone: BUSINESS_INFO.phoneHref.replace('tel:', ''),
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Insurgentes Sur 300 local 5, Colonia Roma',
        addressLocality: 'Ciudad de Mexico',
        addressCountry: 'MX',
      },
      sameAs: [
        BUSINESS_INFO.social.facebook,
        BUSINESS_INFO.social.instagram,
        BUSINESS_INFO.social.tiktok,
        BUSINESS_INFO.social.youtube,
      ],
    });
  }

  private toAbsoluteUrl(value: string): string {
    if (value.startsWith('http')) {
      return value;
    }
    return new URL(value, environment.siteUrl).toString();
  }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private loaded = false;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.loaded) {
      return;
    }

    const { googleAnalyticsId, googleAdsId } = environment.marketing;
    const measurementId = googleAnalyticsId || googleAdsId;

    if (!measurementId) {
      return;
    }

    const gtagScript = this.document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    this.document.head.appendChild(gtagScript);

    const inlineScript = this.document.createElement('script');
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      ${googleAnalyticsId ? `gtag('config', '${googleAnalyticsId}');` : ''}
      ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ''}
    `;
    this.document.head.appendChild(inlineScript);
    this.loaded = true;
  }
}
