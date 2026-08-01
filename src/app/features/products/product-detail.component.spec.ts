import { ProductCategory } from '../../shared/models';
import { ProductDetailComponent } from './product-detail.component';

describe('ProductDetailComponent', () => {
  function createComponent(): ProductDetailComponent {
    const productsService = {
      getCategoryLabel: () => 'Ensambles',
      getSegmentLink: () => '/ensambles',
      toSpecHighlights: () => [],
      toProductCardViewModel: (product: any) => ({
        badges:
          product.discountedPrice && product.offerBadgeVisible
            ? ['Oferta']
            : [],
      }),
    };

    return new ProductDetailComponent(
      {} as any,
      { url: '/ensambles/pc-platinum' } as any,
      productsService as any,
      {} as any,
      {} as any
    );
  }

  it('uses the calculated offer price and preserves the base price', () => {
    const component = createComponent();
    const detail = (component as any).buildDetailViewModel({
      category: ProductCategory.ASSEMBLED,
      title: 'PC Platinum',
      slug: 'pc-platinum',
      description: 'Ensamble',
      image: 'pc.png',
      images: [],
      price: 1000,
      discountedPrice: 900,
      offerBadgeVisible: false,
      stock: 3,
      lowStockThreshold: 1,
      subcategory: 'gaming',
      specifications: {
        processor: { title: 'Ryzen 7' },
        motherboard: { title: 'B650' },
      },
      performance: {
        totalRam: '32 GB',
        storageCapacity: '1 TB',
      },
      useCase: 'gaming',
      performanceTier: 'high',
      certifications: {
        certificate: 'Cybenetics Platinum',
        image: 'https://cms.test/assets/platinum',
        wattage: 850,
      },
      brandLogos: [],
    });

    expect(detail.price).toBe(900);
    expect(detail.originalPrice).toBe(1000);
    expect(detail.badges).not.toContain('Oferta');
  });

  it('uses the certification image selected in the assembly editor', () => {
    const component = createComponent();
    const image = (component as any).buildCertificationImage({
      category: ProductCategory.ASSEMBLED,
      certifications: {
        certificate: 'Cybenetics Platinum',
        image: 'https://cms.test/assets/platinum',
      },
    });

    expect(image).toBe('https://cms.test/assets/platinum');
  });

  it('shows every captured assembly specification including fans', () => {
    const component = createComponent();
    const entries = (component as any).buildSpecEntries({
      category: ProductCategory.ASSEMBLED,
      specifications: {
        processor: { title: 'Ryzen 7 7800X3D' },
        motherboard: { title: 'B650' },
        graphicsCard: { title: 'RTX 4070 Super' },
        ram: { title: '32 GB DDR5' },
        storage: [{ title: '2 TB NVMe' }],
        powerSupply: { title: '850 W' },
        case: { title: 'O11 Dynamic' },
        cooling: { title: 'AIO 360 mm' },
        operatingSystem: 'Windows 11 Pro',
        fans: '6 x Lian Li UNI FAN SL-INF',
      },
      certifications: { certificate: '80 Plus Gold', wattage: 850 },
      performance: { totalRam: '32 GB DDR5', storageCapacity: '2 TB NVMe' },
      useCase: 'gaming',
    });

    expect(entries).toContain(jasmine.objectContaining({ label: 'Ventiladores', value: '6 x Lian Li UNI FAN SL-INF' }));
    expect(entries).toContain(jasmine.objectContaining({ label: 'Sistema operativo', value: 'Windows 11 Pro' }));
    expect(entries).toContain(jasmine.objectContaining({ label: 'Gabinete', value: 'O11 Dynamic' }));
    expect(entries).toContain(jasmine.objectContaining({ label: 'Enfriamiento', value: 'AIO 360 mm' }));
    expect(entries).toContain(jasmine.objectContaining({ label: 'Fuente', value: '850 W' }));
  });

  it('omits empty assembly specifications from the detail', () => {
    const component = createComponent();
    const entries = (component as any).buildSpecEntries({
      category: ProductCategory.ASSEMBLED,
      specifications: {
        processor: { title: 'Ryzen 5' },
        motherboard: { title: '' },
        graphicsCard: { title: '' },
        ram: { title: '' },
        storage: [],
        powerSupply: { title: '' },
        case: { title: '' },
        cooling: { title: '' },
        operatingSystem: '',
        fans: '',
      },
      certifications: { certificate: '', wattage: 0 },
      performance: { totalRam: '', storageCapacity: '' },
      useCase: 'gaming',
    });

    expect(entries).toEqual([{ label: 'CPU', value: 'Ryzen 5' }]);
  });

  it('omits empty assembly summary chips', () => {
    const component = createComponent();
    const chips = (component as any).buildInfoChips({
      category: ProductCategory.ASSEMBLED,
      performance: { totalRam: '', storageCapacity: '' },
      certifications: { certificate: '', wattage: 0 },
    });

    expect(chips).toEqual([]);
  });
});
