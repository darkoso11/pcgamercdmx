import { firstValueFrom } from 'rxjs';
import { of } from 'rxjs';
import { Product, ProductsAdminService } from './products-admin.service';

describe('ProductsAdminService catalog scopes', () => {
  const product = (
    id: string,
    category: Product['category'],
    stock: number,
    published = true
  ): Product => ({
    _id: id,
    title: id,
    slug: id,
    description: id,
    category,
    price: 100,
    image: '',
    images: [],
    brandLogos: [],
    stock,
    lowStockAlert: 3,
    published,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

  function createService(): ProductsAdminService {
    const directus = { isEnabled: () => false };
    const service = new ProductsAdminService(directus as any);
    (service as any).mockProducts = [
      product('healthy-product', 'componentes', 10),
      product('draft-product', 'perifericos', 8, false),
      product('out-product', 'componentes', 0),
      product('low-assembly', 'paquetes', 2),
      product('draft-assembly', 'paquetes', 10, false),
    ];
    (service as any).mockOffers = [
      {
        _id: 'product-offer',
        title: 'Producto',
        description: '',
        type: 'percentage',
        discountValue: 10,
        applicableTo: { products: ['healthy-product'] },
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        active: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
      {
        _id: 'assembly-offer',
        title: 'Ensamble',
        description: '',
        type: 'percentage',
        discountValue: 10,
        applicableTo: { packages: ['low-assembly'] },
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        active: false,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      },
    ];
    return service;
  }

  it('returns domain-specific dashboard metrics and offer counts', async () => {
    const service = createService();

    expect(await firstValueFrom(service.getCatalogDashboardStats('products'))).toEqual({
      total: 3,
      published: 2,
      draft: 1,
      lowStock: 0,
      outOfStock: 1,
      totalOffers: 1,
      activeOffers: 1,
    });
    expect(await firstValueFrom(service.getCatalogDashboardStats('assemblies'))).toEqual({
      total: 2,
      published: 1,
      draft: 1,
      lowStock: 1,
      outOfStock: 0,
      totalOffers: 1,
      activeOffers: 0,
    });
  });

  it('returns recent items only from the requested domain in stock cascade order', async () => {
    const service = createService();

    const products = await firstValueFrom(service.getRecentCatalogItems('products', 10));
    const assemblies = await firstValueFrom(service.getRecentCatalogItems('assemblies', 10));

    expect(products.map((item) => item._id)).toEqual([
      'healthy-product',
      'draft-product',
      'out-product',
    ]);
    expect(assemblies.map((item) => item._id)).toEqual([
      'draft-assembly',
      'low-assembly',
    ]);
  });

  it('returns only the category roots owned by the requested domain', async () => {
    const service = createService();

    const products = await firstValueFrom(service.getCategoriesByDomain('products'));
    const assemblies = await firstValueFrom(service.getCategoriesByDomain('assemblies'));

    expect(products.map((category) => category.slug)).toEqual(['componentes', 'perifericos']);
    expect(assemblies.map((category) => category.slug)).toEqual(['ensambles']);
  });
});

describe('ProductsAdminService offer persistence', () => {
  function createDirectusService() {
    const directus = {
      isEnabled: jasmine.createSpy('isEnabled').and.returnValue(true),
      readItems: jasmine.createSpy('readItems').and.returnValue(of({
        data: [{
          id: 'offer-1',
          title: 'Julio',
          description: 'Promocion',
          catalog_domain: 'products',
          discount_type: 'percentage',
          discount_value: 10,
          applicable_products: ['product-1'],
          applicable_assemblies: [],
          applicable_categories: [],
          starts_at: '2026-07-01T00:00:00.000Z',
          ends_at: '2026-07-31T23:59:59.000Z',
          active: true,
          show_badge: false,
          date_created: '2026-07-01T00:00:00.000Z',
          date_updated: '2026-07-02T00:00:00.000Z',
        }],
      })),
      createItem: jasmine.createSpy('createItem').and.callFake((_collection: string, payload: any) =>
        of({ data: { id: 'offer-2', ...payload } })
      ),
      updateItem: jasmine.createSpy('updateItem').and.callFake((_collection: string, id: string, payload: any) =>
        of({ data: { id, ...payload } })
      ),
      uploadFile: jasmine.createSpy('uploadFile').and.returnValue(of({ data: { id: 'file-1' } })),
      assetUrl: jasmine.createSpy('assetUrl').and.callFake((id: string) => `https://cms.test/assets/${id}`),
    };

    return {
      directus,
      service: new ProductsAdminService(directus as any),
    };
  }

  it('loads offers from the dedicated Directus collection', async () => {
    const { directus, service } = createDirectusService();

    const offers = await firstValueFrom(service.getAllOffers(true));

    expect(directus.readItems).toHaveBeenCalledWith(
      'pc_offers',
      jasmine.objectContaining({ fields: '*' }),
      { auth: true }
    );
    expect(offers[0]).toEqual(jasmine.objectContaining({
      _id: 'offer-1',
      catalogDomain: 'products',
      type: 'percentage',
      discountValue: 10,
      active: true,
      showBadge: false,
      applicableTo: { products: ['product-1'], packages: [], categories: [] },
    }));
  });

  it('creates offers in Directus with independent active and badge controls', async () => {
    const { directus, service } = createDirectusService();
    const offer = {
      title: 'Oferta ensamble',
      description: '',
      catalogDomain: 'assemblies' as const,
      type: 'fixed' as const,
      discountValue: 500,
      applicableTo: { packages: ['assembly-1'] },
      startDate: new Date('2026-08-01T00:00:00.000Z'),
      endDate: new Date('2026-08-31T23:59:59.000Z'),
      active: true,
      showBadge: false,
    };

    const created = await firstValueFrom(service.createOffer(offer));

    expect(directus.createItem).toHaveBeenCalledWith(
      'pc_offers',
      jasmine.objectContaining({
        catalog_domain: 'assemblies',
        discount_type: 'fixed',
        discount_value: 500,
        applicable_assemblies: ['assembly-1'],
        active: true,
        show_badge: false,
      }),
      { auth: true }
    );
    expect(created).toEqual(jasmine.objectContaining({
      _id: 'offer-2',
      catalogDomain: 'assemblies',
      showBadge: false,
    }));
  });

  it('updates and pauses persisted offers instead of mutating memory only', async () => {
    const { directus, service } = createDirectusService();

    await firstValueFrom(service.updateOffer('offer-1', { showBadge: true }));
    await firstValueFrom(service.deactivateOffer('offer-1'));
    await firstValueFrom(service.activateOffer('offer-1'));

    expect(directus.updateItem).toHaveBeenCalledWith(
      'pc_offers',
      'offer-1',
      jasmine.objectContaining({ show_badge: true }),
      { auth: true }
    );
    expect(directus.updateItem).toHaveBeenCalledWith(
      'pc_offers',
      'offer-1',
      { active: false },
      { auth: true }
    );
    expect(directus.updateItem).toHaveBeenCalledWith(
      'pc_offers',
      'offer-1',
      { active: true },
      { auth: true }
    );
  });

  it('lists reusable power certifications with Directus asset URLs', async () => {
    const { directus, service } = createDirectusService();
    directus.readItems.and.returnValue(of({
      data: [{
        id: 'cert-1',
        name: '80 Plus Gold',
        image: 'file-gold',
        active: true,
        sort: 1,
      }],
    }));

    const certifications = await firstValueFrom((service as any).getPowerCertifications());

    expect(directus.readItems).toHaveBeenCalledWith(
      'pc_power_certifications',
      jasmine.objectContaining({ fields: '*' }),
      { auth: true }
    );
    expect(certifications).toEqual([jasmine.objectContaining({
      _id: 'cert-1',
      name: '80 Plus Gold',
      image: 'https://cms.test/assets/file-gold',
      active: true,
    })]);
  });

  it('uploads a certification image before creating its reusable record', async () => {
    const { directus, service } = createDirectusService();
    directus.createItem.and.callFake((_collection: string, payload: any) =>
      of({ data: { id: 'cert-2', ...payload } })
    );
    const file = new File(['gold'], 'gold.png', { type: 'image/png' });

    const certification = await firstValueFrom(
      (service as any).createPowerCertification('80 Plus Platinum', file)
    );

    expect(directus.uploadFile).toHaveBeenCalledWith(file, '80 Plus Platinum', { auth: true });
    expect(directus.createItem).toHaveBeenCalledWith(
      'pc_power_certifications',
      jasmine.objectContaining({
        name: '80 Plus Platinum',
        image: 'file-1',
        active: true,
      }),
      { auth: true }
    );
    expect(certification).toEqual(jasmine.objectContaining({
      _id: 'cert-2',
      name: '80 Plus Platinum',
      image: 'https://cms.test/assets/file-1',
    }));
  });
});
