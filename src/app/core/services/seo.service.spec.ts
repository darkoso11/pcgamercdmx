import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);
    document.head.querySelectorAll('script[data-seo-schema="page"]').forEach((node) => node.remove());
  });

  it('adds page-specific JSON-LD alongside the organization schema', () => {
    service.update({
      structuredData: [{
        id: 'high-end-collection-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'PC Gamer Gama Alta en CDMX',
        },
      }],
    });

    const pageSchema = document.getElementById('high-end-collection-schema');
    expect(pageSchema?.getAttribute('data-seo-schema')).toBe('page');
    expect(pageSchema?.textContent).toContain('CollectionPage');
    expect(document.getElementById('organization-schema')).not.toBeNull();
  });

  it('preserves page-specific JSON-LD when a metadata update omits structured data', () => {
    service.update({
      structuredData: [{
        id: 'temporary-page-schema',
        data: { '@context': 'https://schema.org', '@type': 'WebPage' },
      }],
    });

    service.update({ title: 'Otra pagina' });

    expect(document.getElementById('temporary-page-schema')).not.toBeNull();
    expect(document.getElementById('organization-schema')).not.toBeNull();
  });

  it('clears page-specific JSON-LD explicitly without removing the organization schema', () => {
    service.update({
      structuredData: [{
        id: 'temporary-page-schema',
        data: { '@context': 'https://schema.org', '@type': 'WebPage' },
      }],
    });

    service.clearPageStructuredData();

    expect(document.getElementById('temporary-page-schema')).toBeNull();
    expect(document.getElementById('organization-schema')).not.toBeNull();
  });

  it('updates page schemas without replacing the current static metadata', () => {
    service.update({ title: 'Metadata de la ruta' });
    const updatePageStructuredData = (service as unknown as {
      updatePageStructuredData?: (items: unknown[]) => void;
    }).updatePageStructuredData;

    expect(updatePageStructuredData).toEqual(jasmine.any(Function));
    if (!updatePageStructuredData) {
      return;
    }

    updatePageStructuredData.call(service, [{
      id: 'landing-schema',
      data: { '@context': 'https://schema.org', '@type': 'CollectionPage' },
    }]);

    expect(document.title).toBe('Metadata de la ruta');
    expect(document.getElementById('landing-schema')).not.toBeNull();
  });
});
