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

  it('includes the main image and every unique gallery image', () => {
    const component = createComponent();
    const detail = (component as any).buildDetailViewModel({
      category: ProductCategory.ASSEMBLED,
      title: 'PC Gallery',
      slug: 'pc-gallery',
      description: 'Ensamble',
      image: 'main.png',
      images: ['side.png', 'main.png', 'rear.png'],
      price: 1000,
      stock: 2,
      subcategory: 'gaming',
      specifications: { storage: [] },
      performance: { totalRam: '', storageCapacity: '' },
      certifications: { certificate: '', wattage: 0 },
      brandLogos: [],
    });

    expect(detail.gallery).toEqual(['main.png', 'side.png', 'rear.png']);
  });

  it('selects thumbnails and wraps arrow navigation around the gallery', () => {
    const component = createComponent();
    component.detail = {
      image: 'main.png',
      gallery: ['main.png', 'side.png', 'rear.png'],
    } as any;

    component.selectImage(1);
    expect(component.selectedImage).toBe('side.png');

    component.nextImage();
    expect(component.selectedImage).toBe('rear.png');

    component.nextImage();
    expect(component.selectedImage).toBe('main.png');

    component.previousImage();
    expect(component.selectedImage).toBe('rear.png');
  });

  it('shows a replacement image after the previous image failed to load', () => {
    const component = createComponent();
    const image = document.createElement('img');

    component.handleImageError({ target: image } as unknown as Event);
    component.handleImageLoad({ target: image } as unknown as Event);

    expect(image.style.display).toBe('');
  });

  it('locks page scrolling while the expanded gallery is open and restores it on close', () => {
    const component = createComponent();
    component.detail = {
      image: 'main.png',
      gallery: ['main.png', 'side.png'],
    } as any;
    const originalOverflow = document.body.style.overflow;

    component.openGallery();
    expect(document.body.style.overflow).toBe('hidden');

    component.closeGallery();
    expect(document.body.style.overflow).toBe(originalOverflow);
  });

  it('keeps tab focus inside the expanded gallery', () => {
    const component = createComponent();
    const outsideButton = document.createElement('button');
    const lightbox = document.createElement('div');
    const firstButton = document.createElement('button');
    const lastButton = document.createElement('button');
    document.body.append(outsideButton, lightbox);
    lightbox.append(firstButton, lastButton);
    (component as any).lightbox = { nativeElement: lightbox };
    component.isGalleryOpen = true;
    outsideButton.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    component.handleGalleryKeydown(event);

    expect(event.defaultPrevented).toBeTrue();
    expect(document.activeElement).toBe(firstButton);

    outsideButton.remove();
    lightbox.remove();
  });

  it('releases the expanded gallery state when the displayed product changes', () => {
    const component = createComponent();
    component.detail = {
      image: 'main.png',
      gallery: ['main.png', 'side.png'],
    } as any;
    const originalOverflow = document.body.style.overflow;
    component.openGallery();

    (component as any).resetGalleryState();

    expect(component.isGalleryOpen).toBeFalse();
    expect(document.body.style.overflow).toBe(originalOverflow);
  });
});
