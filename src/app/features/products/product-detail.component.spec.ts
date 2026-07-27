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
});
