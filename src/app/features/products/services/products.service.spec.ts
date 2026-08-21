import { firstValueFrom, of, throwError } from 'rxjs';

import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('loads only the public fields and categories required by the home sliders', async () => {
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(true),
      readItems: jasmine.createSpy('readItems').and.returnValue(of({ data: [] })),
    };
    const service = new ProductsService(directus as any);

    await firstValueFrom(service.getHomeSliderProducts());

    const [, query] = directus.readItems.calls.allArgs().find(
      ([collection]) => collection === 'pc_products'
    )!;
    expect(query.fields).not.toBe('*');
    expect(query['filter[category][_in]']).toBe('assembled,peripheral');
    expect(query.fields).toContain('specifications');
  });

  it('shares one public catalog request between concurrent consumers', async () => {
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(true),
      readItems: jasmine.createSpy('readItems').and.returnValue(of({ data: [] })),
    };
    const service = new ProductsService(directus as any);

    await Promise.all([
      firstValueFrom(service.getAssembledPCs()),
      firstValueFrom(service.getPeripherals()),
    ]);

    expect(
      directus.readItems.calls.allArgs().filter(([collection]) => collection === 'pc_products').length
    ).toBe(1);
    expect(
      directus.readItems.calls.allArgs().filter(([collection]) => collection === 'pc_offers').length
    ).toBe(1);
  });

  it('allows the catalog to retry after a Directus failure', async () => {
    let productRequests = 0;
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(true),
      readItems: jasmine.createSpy('readItems').and.callFake((collection: string) => {
        if (collection === 'pc_products' && ++productRequests === 1) {
          return throwError(() => new Error('temporary failure'));
        }
        return of({ data: [] });
      }),
    };
    const service = new ProductsService(directus as any);

    await firstValueFrom(service.getAssembledPCs());
    await firstValueFrom(service.getAssembledPCs());

    expect(productRequests).toBe(2);
  });

  it('does not expose example assemblies when the backend catalog is disabled', async () => {
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(false),
    };
    const service = new ProductsService(directus as any);

    const products = await firstValueFrom(service.getAssembledPCs());

    expect(products).toEqual([]);
  });

  it('applies an effective assembly offer while keeping its badge visibility independent', async () => {
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(true),
      readItems: jasmine.createSpy('readItems').and.callFake((collection: string) => {
        if (collection === 'pc_offers') {
          return of({
            data: [{
              id: 'offer-1',
              title: 'Oferta silenciosa',
              catalog_domain: 'assemblies',
              discount_type: 'percentage',
              discount_value: 10,
              applicable_assemblies: ['assembly-1'],
              starts_at: '2026-01-01T00:00:00.000Z',
              ends_at: '2030-01-01T00:00:00.000Z',
              active: true,
              show_badge: false,
            }],
          });
        }

        return of({
          data: [{
            id: 'assembly-1',
            title: 'PC Platinum',
            slug: 'pc-platinum',
            description: 'Ensamble con fuente certificada',
            category: 'assembled',
            price: 1000,
            image: 'pc.png',
            stock: 2,
            published: true,
            specifications: {
              processor: 'Ryzen 7',
              motherboard: 'B650',
              ram: '32GB',
              storage: '1TB',
              graphicsCard: 'RTX 4070',
              powerSupply: 'Corsair RM850',
              caseModel: 'Flow',
              cooling: 'AIO',
              watts: 850,
              powerCertificate: 'Cybenetics Platinum',
              powerCertificateImage: 'https://cms.test/assets/platinum',
            },
          }],
        });
      }),
    };
    const service = new ProductsService(directus as any);

    const products = await firstValueFrom(service.getAssembledPCs());

    expect(products[0].price).toBe(1000);
    expect(products[0].discountedPrice).toBe(900);
    expect((products[0] as any).offerBadgeVisible).toBeFalse();
    expect((products[0] as any).certifications.certificate).toBe('Cybenetics Platinum');
    expect((products[0] as any).certifications.image).toBe('https://cms.test/assets/platinum');

    const card = service.toProductCardViewModel(products[0]);
    expect(card.price).toBe(1000);
    expect(card.discountedPrice).toBe(900);
    expect(card.offerBadgeVisible).toBeFalse();
    expect(card.badges).not.toContain('Promocion');
  });
});
