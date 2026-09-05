import { Offer, Product } from './products-admin.service';
import {
  calculateCatalogMetrics,
  calculateOfferPrice,
  getCatalogDashboardItems,
  filterAndSortCatalogItems,
  getOfferDomain,
  isProductInDomain,
} from './admin-catalog-flow.utils';
import * as catalogFlow from './admin-catalog-flow.utils';

describe('admin catalog flow utilities', () => {
  const product = (
    id: string,
    category: Product['category'],
    stock: number,
    lowStockAlert = 3,
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
    lowStockAlert,
    published,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

  it('keeps products and assemblies in mutually exclusive domains', () => {
    expect(isProductInDomain(product('component', 'componentes', 5), 'products')).toBeTrue();
    expect(isProductInDomain(product('peripheral', 'perifericos', 5), 'products')).toBeTrue();
    expect(isProductInDomain(product('assembly', 'paquetes', 5), 'products')).toBeFalse();
    expect(isProductInDomain(product('assembly', 'paquetes', 5), 'assemblies')).toBeTrue();
    expect(isProductInDomain(product('component', 'componentes', 5), 'assemblies')).toBeFalse();
  });

  it('sorts healthy stock before low stock and out of stock while preserving band order', () => {
    const items = [
      product('out-1', 'componentes', 0),
      product('low-1', 'componentes', 2),
      product('healthy-1', 'componentes', 8),
      product('low-2', 'componentes', 1),
      product('healthy-2', 'perifericos', 20),
      product('out-2', 'perifericos', -1),
    ];

    const result = filterAndSortCatalogItems(items, 'products', 'all');

    expect(result.map((item) => item._id)).toEqual([
      'healthy-1',
      'healthy-2',
      'low-1',
      'low-2',
      'out-1',
      'out-2',
    ]);
  });

  it('starts with low stock when no healthy stock exists and still leaves no stock last', () => {
    const items = [
      product('out', 'paquetes', 0),
      product('low', 'paquetes', 1),
    ];

    const result = filterAndSortCatalogItems(items, 'assemblies', 'all');

    expect(result.map((item) => item._id)).toEqual(['low', 'out']);
  });

  it('filters drafts independently from published and stock filters', () => {
    const items = [
      product('published', 'componentes', 10, 3, true),
      product('draft', 'componentes', 10, 3, false),
      product('low', 'componentes', 2, 3, true),
      product('out', 'componentes', 0, 3, true),
      product('assembly-draft', 'paquetes', 10, 3, false),
    ];

    expect(filterAndSortCatalogItems(items, 'products', 'published').map((item) => item._id))
      .toEqual(['published', 'low', 'out']);
    expect(filterAndSortCatalogItems(items, 'products', 'draft').map((item) => item._id))
      .toEqual(['draft']);
    expect(filterAndSortCatalogItems(items, 'products', 'low-stock').map((item) => item._id))
      .toEqual(['low']);
    expect(filterAndSortCatalogItems(items, 'products', 'out-of-stock').map((item) => item._id))
      .toEqual(['out']);
  });

  it('calculates all five metrics inside one domain only', () => {
    const items = [
      product('healthy', 'componentes', 10, 3, true),
      product('draft', 'perifericos', 10, 3, false),
      product('low', 'componentes', 2, 3, true),
      product('out', 'perifericos', 0, 3, true),
      product('assembly', 'paquetes', 0, 3, false),
    ];

    expect(calculateCatalogMetrics(items, 'products')).toEqual({
      total: 4,
      published: 3,
      draft: 1,
      lowStock: 1,
      outOfStock: 1,
    });
    expect(calculateCatalogMetrics(items, 'assemblies')).toEqual({
      total: 1,
      published: 0,
      draft: 1,
      lowStock: 0,
      outOfStock: 1,
    });
  });

  it('returns at most the 20 most recently created products for the recent dashboard view', () => {
    const items = Array.from({ length: 23 }, (_, index) => ({
      ...product(`product-${index}`, 'componentes', 10),
      createdAt: new Date(2026, 0, index + 1),
    }));

    const result = getCatalogDashboardItems(items, 'products', 'recent');

    expect(result).toHaveSize(20);
    expect(result[0]._id).toBe('product-22');
    expect(result[19]._id).toBe('product-3');
  });

  it('keeps stable input order for recent items without comparable creation dates', () => {
    const first = { ...product('first', 'paquetes', 10), createdAt: new Date(Number.NaN) };
    const dated = { ...product('dated', 'paquetes', 10), createdAt: new Date('2026-08-01') };
    const second = { ...product('second', 'paquetes', 10), createdAt: new Date(Number.NaN) };

    expect(getCatalogDashboardItems([first, dated, second], 'assemblies', 'recent').map((item) => item._id))
      .toEqual(['dated', 'first', 'second']);
  });

  it('derives every non-recent dashboard view without limiting the result to 20 items', () => {
    const items = [
      product('published', 'componentes', 10, 3, true),
      product('draft', 'componentes', 10, 3, false),
      product('low', 'perifericos', 2, 3, true),
      product('out', 'perifericos', 0, 3, true),
      product('assembly', 'paquetes', 0, 3, false),
    ];

    expect(getCatalogDashboardItems(items, 'products', 'all').map((item) => item._id))
      .toEqual(['published', 'draft', 'low', 'out']);
    expect(getCatalogDashboardItems(items, 'products', 'published').map((item) => item._id))
      .toEqual(['published', 'low', 'out']);
    expect(getCatalogDashboardItems(items, 'products', 'draft').map((item) => item._id))
      .toEqual(['draft']);
    expect(getCatalogDashboardItems(items, 'products', 'low-stock').map((item) => item._id))
      .toEqual(['low']);
    expect(getCatalogDashboardItems(items, 'products', 'out-of-stock').map((item) => item._id))
      .toEqual(['out']);
  });

  it('assigns offers to one domain and rejects mixed-domain offers', () => {
    const offer = (applicableTo: Offer['applicableTo']): Offer => ({
      title: 'Oferta',
      description: '',
      type: 'percentage',
      discountValue: 10,
      applicableTo,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      active: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    });

    expect(getOfferDomain(offer({ products: ['1'] }))).toBe('products');
    expect(getOfferDomain(offer({ categories: ['2'] }))).toBe('products');
    expect(getOfferDomain(offer({ packages: ['3'] }))).toBe('assemblies');
    expect(getOfferDomain(offer({ products: ['1'], packages: ['3'] }))).toBeNull();
    expect(getOfferDomain(offer({}))).toBeNull();
  });
});

describe('catalog offer pricing utilities', () => {
  it('exposes an automatic offer price calculator', () => {
    expect(typeof (catalogFlow as any).calculateOfferPrice).toBe('function');
  });

  it('calculates and rounds a percentage discount from the base price', () => {
    expect((calculateOfferPrice as any)(4199.99, { type: 'percentage', discountValue: 15 })).toBe(3569.99);
  });

  it('calculates a fixed discount without allowing a negative price', () => {
    expect((calculateOfferPrice as any)(1000, { type: 'fixed', discountValue: 125.5 })).toBe(874.5);
    expect((calculateOfferPrice as any)(100, { type: 'fixed', discountValue: 250 })).toBe(0);
  });

  it('derives scheduled, active, paused and expired states from flags and dates', () => {
    const getOfferStatus = (catalogFlow as any).getOfferStatus;
    const now = new Date('2026-07-25T18:00:00Z');
    const baseOffer = {
      active: true,
      startDate: new Date('2026-07-25T17:00:00Z'),
      endDate: new Date('2026-07-25T19:00:00Z'),
    };

    expect(getOfferStatus({ ...baseOffer, active: false }, now)).toBe('paused');
    expect(getOfferStatus({ ...baseOffer, startDate: new Date('2026-07-26T00:00:00Z') }, now)).toBe('scheduled');
    expect(getOfferStatus(baseOffer, now)).toBe('active');
    expect(getOfferStatus({ ...baseOffer, endDate: new Date('2026-07-25T17:30:00Z') }, now)).toBe('expired');
  });

  it('keeps badge visibility independent from discount effectiveness', () => {
    const resolveOfferPresentation = (catalogFlow as any).resolveOfferPresentation;
    const now = new Date('2026-07-25T18:00:00Z');
    const offer = {
      type: 'percentage',
      discountValue: 10,
      active: true,
      showBadge: false,
      startDate: new Date('2026-07-25T17:00:00Z'),
      endDate: new Date('2026-07-25T19:00:00Z'),
    };

    expect(resolveOfferPresentation(1000, offer, now)).toEqual({
      basePrice: 1000,
      effectivePrice: 900,
      hasEffectiveOffer: true,
      showOfferBadge: false,
    });
  });

  it('finds overlapping offers that target the same item and ignores different domains', () => {
    const findOfferConflicts = (catalogFlow as any).findOfferConflicts;
    const candidate = {
      _id: 'candidate',
      catalogDomain: 'products',
      active: true,
      startDate: new Date('2026-08-01T00:00:00Z'),
      endDate: new Date('2026-08-31T23:59:59Z'),
      applicableTo: { products: ['product-1'] },
    };
    const conflicts = findOfferConflicts(candidate, [
      {
        _id: 'same-item',
        catalogDomain: 'products',
        active: true,
        startDate: new Date('2026-08-15T00:00:00Z'),
        endDate: new Date('2026-09-15T23:59:59Z'),
        applicableTo: { products: ['product-1'] },
      },
      {
        _id: 'other-domain',
        catalogDomain: 'assemblies',
        active: true,
        startDate: new Date('2026-08-15T00:00:00Z'),
        endDate: new Date('2026-09-15T23:59:59Z'),
        applicableTo: { packages: ['product-1'] },
      },
    ]);

    expect(conflicts.map((offer: Offer) => offer._id)).toEqual(['same-item']);
  });
});
