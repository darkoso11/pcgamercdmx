import { ProductCategory, ProductStatus } from '../../shared/models';
import {
  mapAdminProductToDirectusPayload,
  mapArticleToDirectusPayload,
  mapCatalogProductToDirectusPayload,
  mapDirectusBlogPostToArticle,
  mapDirectusProductToAdminProduct,
  mapDirectusProductToCatalogProduct,
} from './directus-content.mapper';

describe('Directus content mapper', () => {
  it('maps Directus products to the admin product shape', () => {
    const product = mapDirectusProductToAdminProduct({
      id: 12,
      title: 'PC Armada Gaming 2K',
      slug: 'pc-armada-gaming-2k',
      description: 'PC para gaming 2K',
      category: 'assembled',
      subcategory: 'pc-gaming',
      price: '2500.50',
      discounted_price: '2200',
      image: 'https://example.test/pc.png',
      images: ['https://example.test/pc-alt.png'],
      specifications: {
        processor: 'Intel i7-13700K',
        motherboard: 'ASUS B760',
        ram: '32GB DDR4',
        storage: '1TB SSD NVMe',
        graphicsCard: 'RTX 4070',
        powerSupply: '850W 80+ Gold',
        caseModel: 'NZXT H7 Flow RGB',
        cooling: 'Arctic Liquid 280mm',
        admin: {
          productType: 'gabinete',
          brand: 'NZXT',
          categoryId: '1',
          subcategoryId: '1-2',
          discountPercent: 12,
          currency: 'MXN',
          sku: 'PCG-2K',
          internalNotes: 'Demo',
        },
      },
      brand_logos: [{ src: 'brand.png', alt: 'Brand' }],
      stock: 5,
      low_stock_alert: 2,
      featured: true,
      published: true,
      meta_title: 'Meta title',
      meta_description: 'Meta description',
      keywords: ['gaming', '2k'],
    });

    expect(product._id).toBe('12');
    expect(product.category).toBe('paquetes');
    expect(product.discountedPrice).toBe(2200);
    expect(product.processor).toBe('Intel i7-13700K');
    expect(product.productType).toBe('gabinete');
    expect(product.brand).toBe('NZXT');
    expect(product.categoryId).toBe('1');
    expect(product.subcategoryId).toBe('1-2');
    expect(product.keywords).toEqual(['gaming', '2k']);
  });

  it('maps admin products to Directus payloads without losing editor metadata', () => {
    const payload = mapAdminProductToDirectusPayload({
      title: 'Teclado mecanico',
      slug: 'teclado-mecanico',
      description: 'Teclado RGB para gaming',
      category: 'perifericos',
      price: 1299,
      discountedPrice: 999,
      productType: 'periferico',
      brand: 'Corsair',
      categoryId: '3',
      subcategoryId: '3-1',
      discountPercent: 23,
      currency: 'MXN',
      sku: 'KB-001',
      image: 'keyboard.png',
      images: [],
      gallery: ['keyboard-2.png'],
      brandLogos: [],
      stock: 8,
      lowStockAlert: 2,
      published: true,
      featured: true,
      keywords: ['teclado', 'rgb'],
      metaDescription: 'Meta description',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date('2026-01-02T00:00:00Z'),
    });

    expect(payload.category).toBe('peripheral');
    expect(payload.discounted_price).toBe(999);
    const admin = payload.specifications['admin'] as Record<string, unknown>;
    expect(admin['brand']).toBe('Corsair');
    expect(admin['categoryId']).toBe('3');
    expect(admin['gallery']).toEqual(['keyboard-2.png']);
  });

  it('maps Directus blog posts to articles and back', () => {
    const article = mapDirectusBlogPostToArticle({
      id: 5,
      title: 'Como elegir GPU',
      slug: 'como-elegir-gpu',
      summary: 'Guia rapida',
      cover_image: { url: '/gpu.jpg', alt: 'GPU' },
      sections: [{ title: 'Intro', text: '<p>Hola</p>', order: 0 }],
      category: 'componentes',
      subcategory: 'gpu',
      tags: ['gpu'],
      published: true,
      published_at: '2026-05-22T12:00:00.000Z',
    });

    expect(article._id).toBe('5');
    expect(article.coverImage?.url).toBe('/gpu.jpg');
    expect(article.categoryId).toBe('componentes');
    expect(article.subCategoryId).toBe('gpu');

    const payload = mapArticleToDirectusPayload(article);
    expect(payload.cover_image).toEqual({ url: '/gpu.jpg', alt: 'GPU' });
    expect(payload.category).toBe('componentes');
    expect(payload.subcategory).toBe('gpu');
    expect(payload.published_at).toBe('2026-05-22T12:00:00.000Z');
  });

  it('preserves catalog payloads stored inside Directus JSON', () => {
    const directusPayload = mapCatalogProductToDirectusPayload({
      _id: 'pc-001',
      id: 1,
      sku: 'PC-001',
      category: ProductCategory.ASSEMBLED,
      subcategory: 'pc-gaming',
      status: ProductStatus.ACTIVE,
      title: 'Apex Starter',
      slug: 'apex-starter',
      image: '/apex.png',
      images: ['/apex.png'],
      price: 15999,
      currency: 'MXN',
      description: 'PC gaming',
      fullDescription: 'PC gaming completa',
      stock: 4,
      published: true,
      featured: true,
      createdAt: new Date('2026-04-01T10:00:00Z'),
      updatedAt: new Date('2026-04-01T10:00:00Z'),
      specifications: {
        processor: { _id: 'cpu', title: 'Ryzen 5', specs: '6 cores' },
        motherboard: { _id: 'mb', title: 'B650', specs: 'AM5' },
        ram: { _id: 'ram', title: '32GB DDR5', specs: '2x16' },
        storage: [{ _id: 'ssd', title: '1TB NVMe', specs: 'Gen4' }],
        graphicsCard: { _id: 'gpu', title: 'RTX 4060', specs: '8GB' },
        powerSupply: { _id: 'psu', title: '650W', specs: 'Bronze' },
        case: { _id: 'case', title: 'Flow', specs: 'ATX' },
        cooling: { _id: 'cool', title: 'Air', specs: 'Tower' },
      },
      performance: {
        gpuBrand: 'NVIDIA',
        gpuMemory: '8GB',
        cpuBrand: 'AMD',
        cpuCores: 6,
        totalRam: '32GB DDR5',
        storageCapacity: '1TB NVMe',
      },
      certifications: {
        certificate: '80+ Bronze',
        wattage: 650,
      },
      brandLogos: [{ name: 'AMD', logo: '/amd.png' }],
      useCase: 'gaming',
      performanceTier: 'entry',
    } as any);

    const catalog = directusPayload.specifications['catalog'] as Record<string, unknown>;
    expect(catalog['slug']).toBe('apex-starter');

    const catalogProduct = mapDirectusProductToCatalogProduct({
      id: 7,
      ...directusPayload,
      price: '15999.00000',
    });

    expect(catalogProduct.slug).toBe('apex-starter');
    expect(catalogProduct.category).toBe(ProductCategory.ASSEMBLED);
    expect(catalogProduct.price).toBe(15999);
  });
});
