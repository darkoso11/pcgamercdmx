import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  AccessoryProduct,
  AssembledPC,
  ComponentProduct,
  ComponentType,
  FilterCriteria,
  PeripheralProduct,
  PeripheralType,
  ProductCategory,
  ProductStatus,
  SearchResult,
} from '../../../shared/models';
import { PerformanceTier, UseCase } from '../../../shared/models/product.model';

export type CatalogProduct =
  | AssembledPC
  | ComponentProduct
  | PeripheralProduct
  | AccessoryProduct;

export interface ProductCardViewModel {
  slug: string;
  title: string;
  image: string;
  price: number;
  discountedPrice?: number;
  description: string;
  category: ProductCategory;
  categoryLabel: string;
  subcategory: string;
  badges: string[];
  specHighlights: Array<{ label: string; value: string }>;
  ctaLabel: string;
}

export interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  processor: string;
  motherboard: string;
  ram: string;
  storage: string;
  graphicsCard: string;
  slug: string;
  brandLogos: Array<{ src: string; alt: string; position?: string }>;
  powerCertificate: string;
  watts: number;
  category?: 'paquete' | 'periferico' | 'componente';
  description?: string;
  specifications?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly assembledPCs = this.buildAssembledPCs();
  private readonly components = this.buildComponents();
  private readonly peripherals = this.buildPeripherals();
  private readonly accessories: AccessoryProduct[] = [];

  getAssembledPCs(filters?: FilterCriteria): Observable<AssembledPC[]> {
    return of(this.applyFilters(this.assembledPCs, filters));
  }

  getComponentsByType(
    type?: ComponentType,
    filters?: FilterCriteria
  ): Observable<ComponentProduct[]> {
    const products = type
      ? this.components.filter((product) => product.componentType === type)
      : this.components;
    return of(this.applyFilters(products, filters));
  }

  getPeripherals(
    type?: PeripheralType,
    filters?: FilterCriteria
  ): Observable<PeripheralProduct[]> {
    const products = type
      ? this.peripherals.filter((product) => product.peripheralType === type)
      : this.peripherals;
    return of(this.applyFilters(products, filters));
  }

  getCatalogProducts(filters?: FilterCriteria): Observable<CatalogProduct[]> {
    return of(this.applyFilters(this.getAllCatalogProducts(), filters));
  }

  getFeaturedCatalogProducts(limit = 6): Observable<CatalogProduct[]> {
    const featured = this.getAllCatalogProducts()
      .filter((product) => product.featured)
      .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
      .slice(0, limit);

    return of(featured);
  }

  getCatalogProductBySlug(slug: string): Observable<CatalogProduct | null> {
    const product =
      this.getAllCatalogProducts().find((item) => item.slug === slug) ?? null;
    return of(product);
  }

  getRelatedCatalogProducts(
    slug: string,
    limit = 4
  ): Observable<CatalogProduct[]> {
    const current = this.getAllCatalogProducts().find((item) => item.slug === slug);
    if (!current) {
      return of([]);
    }

    const related = this.getAllCatalogProducts()
      .filter((item) => item.slug !== slug && item.category === current.category)
      .sort((a, b) => {
        const featuredWeight = Number(b.featured) - Number(a.featured);
        if (featuredWeight !== 0) {
          return featuredWeight;
        }
        return a.title.localeCompare(b.title);
      })
      .slice(0, limit);

    return of(related);
  }

  searchCatalog(query: string, limit = 20): Observable<SearchResult> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return of({
        assembled: [],
        components: [],
        peripherals: [],
        accessories: [],
      });
    }

    const filterByQuery = <T extends CatalogProduct>(products: T[]) =>
      products.filter((product) => {
        const text = [
          product.title,
          product.description,
          product.fullDescription,
          product.subcategory,
          ...(product.keywords ?? []),
          ...this.toSpecHighlights(product, 8).map((item) => item.value),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return text.includes(normalized);
      });

    return of({
      assembled: filterByQuery(this.assembledPCs).slice(0, limit),
      components: filterByQuery(this.components).slice(0, limit),
      peripherals: filterByQuery(this.peripherals).slice(0, limit),
      accessories: filterByQuery(this.accessories).slice(0, limit),
    });
  }

  toProductCardViewModel(product: CatalogProduct): ProductCardViewModel {
    return {
      slug: product.slug,
      title: product.title,
      image: product.image,
      price: product.price,
      discountedPrice: product.discountedPrice,
      description: product.description,
      category: product.category,
      categoryLabel: this.getCategoryLabel(product.category),
      subcategory: product.subcategory,
      badges: this.buildBadges(product),
      specHighlights: this.toSpecHighlights(product, 4),
      ctaLabel:
        product.category === ProductCategory.ASSEMBLED
          ? 'Ver ensamble'
          : 'Ver producto',
    };
  }

  getCategoryLabel(category: ProductCategory): string {
    switch (category) {
      case ProductCategory.ASSEMBLED:
        return 'Ensambles';
      case ProductCategory.COMPONENT:
        return 'Componentes';
      case ProductCategory.PERIPHERAL:
        return 'Perifericos';
      case ProductCategory.ACCESSORY:
        return 'Accesorios';
    }
  }

  getSegmentLink(category: ProductCategory): string {
    switch (category) {
      case ProductCategory.ASSEMBLED:
        return '/ensambles';
      case ProductCategory.COMPONENT:
        return '/productos/componentes';
      case ProductCategory.PERIPHERAL:
        return '/productos/perifericos';
      case ProductCategory.ACCESSORY:
        return '/productos';
    }
  }

  getDetailLink(category: ProductCategory, slug: string): string[] {
    return category === ProductCategory.ASSEMBLED
      ? ['/ensambles', slug]
      : ['/productos', slug];
  }

  toSpecHighlights(
    product: CatalogProduct,
    limit = 4
  ): Array<{ label: string; value: string }> {
    if (product.category === ProductCategory.ASSEMBLED) {
      return [
        { label: 'CPU', value: product.specifications.processor.title },
        { label: 'GPU', value: product.specifications.graphicsCard.title },
        { label: 'RAM', value: product.performance.totalRam },
        { label: 'Almacenamiento', value: product.performance.storageCapacity },
        { label: 'Fuente', value: `${product.certifications.wattage}W ${product.certifications.certificate}` },
      ].slice(0, limit);
    }

    if (product.category === ProductCategory.COMPONENT) {
      const specs = product.specifications;
      if (product.componentType === 'cpu' && 'cores' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Modelo', value: specs.model },
          { label: 'Nucleos', value: `${specs.cores}` },
          { label: 'Socket', value: specs.socket },
        ].slice(0, limit);
      }

      if (product.componentType === 'gpu' && 'memorySize' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Modelo', value: specs.model },
          { label: 'VRAM', value: specs.memorySize },
          { label: 'Interfaz', value: specs.interface },
        ].slice(0, limit);
      }

      if ('capacity' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Modelo', value: specs.model },
          { label: 'Capacidad', value: specs.capacity },
          { label: 'Tipo', value: product.componentType.toUpperCase() },
        ].slice(0, limit);
      }

      if ('wattage' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Modelo', value: specs.model },
          { label: 'Potencia', value: `${specs.wattage}W` },
          { label: 'Certificacion', value: specs.efficiency },
        ].slice(0, limit);
      }

      return [
        { label: 'Tipo', value: product.componentType.toUpperCase() },
        { label: 'Categoria', value: this.getCategoryLabel(product.category) },
      ];
    }

    if (product.category === ProductCategory.PERIPHERAL) {
      const specs = product.specifications;
      if (product.peripheralType === 'keyboard' && 'layout' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Switch', value: specs.keySwitch ?? specs.keyType },
          { label: 'Layout', value: specs.layout },
          { label: 'Conexion', value: specs.connectionType },
        ].slice(0, limit);
      }

      if (product.peripheralType === 'mouse' && 'dpi' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Sensor', value: specs.sensor ?? 'Gaming sensor' },
          { label: 'DPI', value: `${specs.dpi.max}` },
          { label: 'Conexion', value: specs.connectionType },
        ].slice(0, limit);
      }

      if (product.peripheralType === 'monitor' && 'resolution' in specs) {
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Resolucion', value: specs.resolution },
          { label: 'Refresh', value: `${specs.refreshRate}Hz` },
          { label: 'Panel', value: specs.panelType },
        ].slice(0, limit);
      }

      if (product.peripheralType === 'headset' && 'connectionType' in specs) {
        const headsetSpecs = specs;
        return [
          { label: 'Marca', value: specs.brand },
          { label: 'Driver', value: 'driver' in headsetSpecs ? (headsetSpecs.driver ?? '50mm') : '50mm' },
          { label: 'Conexion', value: specs.connectionType },
          { label: 'Surround', value: 'surround' in headsetSpecs ? (headsetSpecs.surround ?? 'Stereo') : 'Stereo' },
        ].slice(0, limit);
      }

      return [
        { label: 'Marca', value: specs.brand },
        { label: 'Categoria', value: product.peripheralType },
      ];
    }

    return [
      { label: 'Categoria', value: this.getCategoryLabel(product.category) },
    ];
  }

  getAllProducts(): Observable<Product[]> {
    return of(
      this.assembledPCs.map((product, index) => this.toLegacyProduct(product, index + 1))
    );
  }

  getProductBySlug(slug: string): Observable<Product | undefined> {
    const product = this.assembledPCs.find((item) => item.slug === slug);
    return of(product ? this.toLegacyProduct(product, 1) : undefined);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    if (category === 'paquete') {
      return of(
        this.assembledPCs.map((product, index) => this.toLegacyProduct(product, index + 1))
      );
    }

    if (category === 'componente') {
      return of(
        this.components.map((product, index) => this.toLegacyProductFromComponent(product, index + 1))
      );
    }

    return of(
      this.peripherals.map((product, index) => this.toLegacyProductFromPeripheral(product, index + 1))
    );
  }

  getRelatedProducts(slug: string, limit = 4): Observable<Product[]> {
    const current = this.assembledPCs.find((item) => item.slug === slug);
    if (!current) {
      return of([]);
    }

    return of(
      this.assembledPCs
        .filter((item) => item.slug !== slug && item.useCase === current.useCase)
        .slice(0, limit)
        .map((item, index) => this.toLegacyProduct(item, index + 1))
    );
  }

  searchProducts(term: string): Observable<Product[]> {
    const normalized = term.trim().toLowerCase();
    return of(
      this.assembledPCs
        .filter(
          (product) =>
            product.title.toLowerCase().includes(normalized) ||
            product.description.toLowerCase().includes(normalized)
        )
        .map((product, index) => this.toLegacyProduct(product, index + 1))
    );
  }

  private getAllCatalogProducts(): CatalogProduct[] {
    return [
      ...this.assembledPCs,
      ...this.components,
      ...this.peripherals,
      ...this.accessories,
    ];
  }

  private applyFilters<T extends CatalogProduct>(
    products: T[],
    filters?: FilterCriteria
  ): T[] {
    if (!filters) {
      return [...products];
    }

    let results = [...products].filter((product) => product.status !== ProductStatus.DISCONTINUED);

    if (filters.categories?.length) {
      results = results.filter((product) => filters.categories?.includes(product.category));
    }

    if (filters.subcategories?.length) {
      results = results.filter((product) =>
        filters.subcategories?.includes(product.subcategory)
      );
    }

    if (filters.featured) {
      results = results.filter((product) => product.featured);
    }

    if (filters.search) {
      const normalized = filters.search.toLowerCase();
      results = results.filter((product) => {
        const haystack = [
          product.title,
          product.description,
          ...(product.keywords ?? []),
          ...this.toSpecHighlights(product, 8).map((item) => item.value),
        ]
          .join(' ')
          .toLowerCase();

        return haystack.includes(normalized);
      });
    }

    if (filters.brands?.length) {
      results = results.filter((product) => {
        const brand = this.extractBrand(product);
        return brand ? filters.brands?.includes(brand) : false;
      });
    }

    if (filters.minPrice !== undefined) {
      results = results.filter((product) => product.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      results = results.filter((product) => product.price <= filters.maxPrice!);
    }

    if (filters.sortBy) {
      results = this.sortProducts(results, filters.sortBy);
    }

    if (filters.page && filters.limit) {
      const start = (filters.page - 1) * filters.limit;
      results = results.slice(start, start + filters.limit);
    }

    return results;
  }

  private sortProducts<T extends CatalogProduct>(
    products: T[],
    sortBy: NonNullable<FilterCriteria['sortBy']>
  ): T[] {
    const sorted = [...products];

    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'popular':
      case 'rating':
        return sorted.sort(
          (a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
        );
      case 'name':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
  }

  private buildBadges(product: CatalogProduct): string[] {
    const badges: string[] = [];

    if (product.featured) {
      badges.push('Destacado');
    }

    if (product.discountedPrice) {
      badges.push('Promocion');
    }

    if (product.stock <= (product.lowStockThreshold ?? 2)) {
      badges.push('Ultimas piezas');
    }

    if (product.category === ProductCategory.ASSEMBLED) {
      badges.push(this.formatLabel(product.useCase));
      badges.push(product.performanceTier.toUpperCase());
    }

    if (product.category === ProductCategory.COMPONENT) {
      badges.push(product.componentType.toUpperCase());
    }

    if (product.category === ProductCategory.PERIPHERAL) {
      badges.push(this.formatLabel(product.peripheralType));
    }

    return badges.slice(0, 4);
  }

  private extractBrand(product: CatalogProduct): string | null {
    if (product.category === ProductCategory.ASSEMBLED) {
      return product.performance.cpuBrand;
    }

    if ('specifications' in product && 'brand' in product.specifications) {
      return product.specifications.brand;
    }

    return null;
  }

  private formatLabel(value: string): string {
    return value
      .split('-')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  private toLegacyProduct(product: AssembledPC, id: number): Product {
    return {
      id,
      title: product.title,
      image: product.image,
      price: product.price,
      processor: product.specifications.processor.title,
      motherboard: product.specifications.motherboard.title,
      ram: product.specifications.ram.title,
      storage: product.specifications.storage.map((item) => item.title).join(' + '),
      graphicsCard: product.specifications.graphicsCard.title,
      slug: product.slug,
      brandLogos: product.brandLogos.map((logo) => ({ src: logo.logo, alt: logo.name })),
      powerCertificate: this.getCertificationImage(product.certifications.certificate),
      watts: product.certifications.wattage,
      category: 'paquete',
      description: product.description,
      specifications: Object.fromEntries(
        this.toSpecHighlights(product, 8).map((item) => [item.label, item.value])
      ),
    };
  }

  private toLegacyProductFromComponent(
    product: ComponentProduct,
    id: number
  ): Product {
    const specMap = Object.fromEntries(
      this.toSpecHighlights(product, 8).map((item) => [item.label, item.value])
    );

    return {
      id,
      title: product.title,
      image: product.image,
      price: product.price,
      processor: '',
      motherboard: '',
      ram: '',
      storage: '',
      graphicsCard: '',
      slug: product.slug,
      brandLogos: [],
      powerCertificate: '',
      watts: 0,
      category: 'componente',
      description: product.description,
      specifications: specMap,
    };
  }

  private toLegacyProductFromPeripheral(
    product: PeripheralProduct,
    id: number
  ): Product {
    const specMap = Object.fromEntries(
      this.toSpecHighlights(product, 8).map((item) => [item.label, item.value])
    );

    return {
      id,
      title: product.title,
      image: product.image,
      price: product.price,
      processor: '',
      motherboard: '',
      ram: '',
      storage: '',
      graphicsCard: '',
      slug: product.slug,
      brandLogos: [],
      powerCertificate: '',
      watts: 0,
      category: 'periferico',
      description: product.description,
      specifications: specMap,
    };
  }

  private getCertificationImage(certificate: string): string {
    switch (certificate) {
      case '80+ Bronze':
        return 'assets/img/certificaciones/80_Plus_Bronze.svg.png';
      case '80+ Gold':
      case '80+ Platinum':
      case '80+ Silver':
        return 'assets/img/certificaciones/80plusgold.png';
      default:
        return 'assets/img/certificaciones/80plusgold.png';
    }
  }

  private buildAssembledPCs(): AssembledPC[] {
    const baseDate = new Date('2026-04-01T10:00:00');

    return [
      {
        _id: 'pc-001',
        id: 1,
        sku: 'PCG-ENTRY-1080',
        category: ProductCategory.ASSEMBLED,
        subcategory: 'pc-gaming',
        status: ProductStatus.ACTIVE,
        title: 'Apex Starter 1080p',
        slug: 'apex-starter-1080p',
        image: 'assets/img/gabinetes/BR-938686_1.png',
        images: ['assets/img/gabinetes/BR-938686_1.png'],
        price: 18999,
        currency: 'MXN',
        description:
          'Equipo equilibrado para shooters, eSports y gaming 1080p con excelente margen de actualizacion.',
        fullDescription:
          'Pensada para quienes quieren entrar al mundo del PC gaming con una base solida, buena ventilacion y componentes faciles de escalar.',
        metaTitle: 'Apex Starter 1080p | Ensamble Gaming',
        metaDescription:
          'PC armada para gaming 1080p con Ryzen 5, RTX 4060 y almacenamiento NVMe.',
        keywords: ['pc gaming 1080p', 'ensamble ryzen', 'rtx 4060'],
        stock: 4,
        lowStockThreshold: 2,
        status_text: 'Disponible',
        featured: true,
        position: 1,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        useCase: UseCase.GAMING,
        performanceTier: PerformanceTier.ENTRY,
        targetAudience: 'Jugadores competitivos y primer ensamble gaming.',
        specifications: {
          processor: { _id: 'cpu-001', title: 'AMD Ryzen 5 7600', specs: '6 nucleos / 12 hilos' },
          motherboard: { _id: 'mb-001', title: 'B650M WiFi', specs: 'AM5, DDR5' },
          ram: { _id: 'ram-001', title: '32GB DDR5 6000MHz', specs: '2x16GB' },
          storage: [{ _id: 'sto-001', title: '1TB NVMe Gen4', specs: 'Hasta 5000 MB/s' }],
          graphicsCard: { _id: 'gpu-001', title: 'NVIDIA GeForce RTX 4060', specs: '8GB GDDR6' },
          powerSupply: { _id: 'psu-001', title: '650W 80+ Bronze', specs: 'Semi modular' },
          case: { _id: 'case-001', title: 'Airflow Mid Tower', specs: 'Panel frontal mesh' },
          cooling: { _id: 'cool-001', title: 'Torre de aire 120mm', specs: 'PWM RGB' },
        },
        performance: {
          gpuBrand: 'NVIDIA',
          gpuMemory: '8GB GDDR6',
          cpuBrand: 'AMD',
          cpuCores: 6,
          cpuThreads: 12,
          totalRam: '32GB DDR5',
          storageCapacity: '1TB NVMe',
        },
        certifications: {
          certificate: '80+ Bronze',
          wattage: 650,
          manufacturer: 'Corsair',
          modular: 'Semi',
        },
        brandLogos: [
          { name: 'AMD', logo: 'assets/img/marcas/AMD-Ryzen.png' },
          { name: 'NVIDIA', logo: 'assets/img/marcas/Nvidia-qe15uqyz4tjnw0jnylr2lzteyll6r14yttmbqndasi.png' },
          { name: 'Corsair', logo: 'assets/img/marcas/corsairbrand.png' },
        ],
        customizable: true,
        customizationOptions: {
          ram: ['32GB DDR5', '64GB DDR5'],
          storage: ['1TB NVMe', '2TB NVMe'],
          graphicsCard: ['RTX 4060', 'RTX 4060 Ti'],
        },
        warranty: {
          duration: 12,
          type: 'Parts & Labor',
          provider: 'PC Gamer CDMX',
        },
        readyToShip: true,
        estimatedDelivery: { min: 2, max: 5 },
        preBuilt: true,
        freeShipping: true,
        highlights: [
          'Ideal para gaming 1080p alto',
          'Plataforma AM5 lista para crecer',
          '32GB DDR5 de base',
        ],
      },
      {
        _id: 'pc-002',
        id: 2,
        sku: 'PCG-STREAM-1440',
        category: ProductCategory.ASSEMBLED,
        subcategory: 'pc-streaming',
        status: ProductStatus.ACTIVE,
        title: 'Creator Stream 1440',
        slug: 'creator-stream-1440',
        image: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png',
        images: ['assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png'],
        price: 28999,
        currency: 'MXN',
        description:
          'Configuracion orientada a streaming y multitarea con potencia suficiente para jugar y producir contenido.',
        fullDescription:
          'Equilibrio entre CPU multinucleo, GPU moderna y refrigeracion liquida para sesiones largas de streaming.',
        metaTitle: 'Creator Stream 1440 | PC Streaming',
        metaDescription:
          'PC para streaming, gaming y contenido con Ryzen 7, RTX 4070 y 32GB DDR5.',
        keywords: ['pc streaming', 'pc para editar video', 'rtx 4070'],
        stock: 3,
        lowStockThreshold: 1,
        status_text: 'Disponible',
        featured: true,
        position: 2,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        useCase: UseCase.STREAMING,
        performanceTier: PerformanceTier.MID,
        targetAudience: 'Creadores que juegan y transmiten desde un solo equipo.',
        specifications: {
          processor: { _id: 'cpu-002', title: 'AMD Ryzen 7 7700X', specs: '8 nucleos / 16 hilos' },
          motherboard: { _id: 'mb-002', title: 'X670 Gaming WiFi', specs: 'AM5, PCIe 5.0' },
          ram: { _id: 'ram-002', title: '32GB DDR5 6400MHz', specs: '2x16GB' },
          storage: [
            { _id: 'sto-002', title: '1TB NVMe Gen4', specs: 'SO principal' },
            { _id: 'sto-003', title: '2TB SSD SATA', specs: 'Biblioteca multimedia' },
          ],
          graphicsCard: { _id: 'gpu-002', title: 'NVIDIA GeForce RTX 4070 Super', specs: '12GB GDDR6X' },
          powerSupply: { _id: 'psu-002', title: '750W 80+ Gold', specs: 'Full modular' },
          case: { _id: 'case-002', title: 'NZXT H9 Flow', specs: 'Dual chamber airflow' },
          cooling: { _id: 'cool-002', title: 'AIO 360mm', specs: 'ARGB' },
        },
        performance: {
          gpuBrand: 'NVIDIA',
          gpuMemory: '12GB GDDR6X',
          cpuBrand: 'AMD',
          cpuCores: 8,
          cpuThreads: 16,
          totalRam: '32GB DDR5',
          storageCapacity: '1TB NVMe + 2TB SSD',
        },
        certifications: {
          certificate: '80+ Gold',
          wattage: 750,
          manufacturer: 'Thermaltake',
          modular: 'Full',
        },
        brandLogos: [
          { name: 'AMD', logo: 'assets/img/marcas/AMD-Ryzen.png' },
          { name: 'NVIDIA', logo: 'assets/img/marcas/Nvidia-qe15uqyz4tjnw0jnylr2lzteyll6r14yttmbqndasi.png' },
          { name: 'Thermaltake', logo: 'assets/img/marcas/thermaltake.png' },
        ],
        customizable: true,
        customizationOptions: {
          ram: ['32GB DDR5', '64GB DDR5'],
          storage: ['1TB + 2TB', '2TB + 2TB'],
        },
        warranty: {
          duration: 12,
          type: 'Parts & Labor',
        },
        readyToShip: false,
        estimatedDelivery: { min: 4, max: 7 },
        preBuilt: true,
        freeShipping: true,
        highlights: [
          'Preparada para streaming simultaneo',
          'GPU con codificador moderno',
          'Sistema de flujo de aire premium',
        ],
      },
      {
        _id: 'pc-003',
        id: 3,
        sku: 'PCG-EDIT-4K',
        category: ProductCategory.ASSEMBLED,
        subcategory: 'pc-editing',
        status: ProductStatus.ACTIVE,
        title: 'Render Forge Studio',
        slug: 'render-forge-studio',
        image: 'assets/img/gabinetes/rog-hyperion-gr701.png',
        images: ['assets/img/gabinetes/rog-hyperion-gr701.png'],
        price: 42999,
        currency: 'MXN',
        description:
          'Workhorse pensada para edicion, motion graphics y cargas pesadas de productividad creativa.',
        fullDescription:
          'Configuracion con mas memoria, almacenamiento dual y margen termico para flujos de trabajo profesionales.',
        metaTitle: 'Render Forge Studio | PC Edicion',
        metaDescription:
          'PC para edicion y trabajo creativo con Intel Core i7, RTX 4070 Ti Super y 64GB DDR5.',
        keywords: ['pc para editar', 'workstation creativa', 'pc 64gb ram'],
        stock: 2,
        lowStockThreshold: 1,
        status_text: 'Bajo pedido',
        featured: true,
        position: 3,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        useCase: UseCase.EDITING,
        performanceTier: PerformanceTier.HIGH,
        targetAudience: 'Editores de video, motion y fotografia avanzada.',
        specifications: {
          processor: { _id: 'cpu-003', title: 'Intel Core i7-14700K', specs: '20 nucleos / 28 hilos' },
          motherboard: { _id: 'mb-003', title: 'Z790 Creator', specs: 'Thunderbolt, DDR5' },
          ram: { _id: 'ram-003', title: '64GB DDR5 6000MHz', specs: '2x32GB' },
          storage: [
            { _id: 'sto-004', title: '2TB NVMe Gen4', specs: 'Scratch disk' },
            { _id: 'sto-005', title: '4TB HDD', specs: 'Archivo de proyectos' },
          ],
          graphicsCard: { _id: 'gpu-003', title: 'NVIDIA GeForce RTX 4070 Ti Super', specs: '16GB GDDR6X' },
          powerSupply: { _id: 'psu-003', title: '850W 80+ Gold', specs: 'Full modular' },
          case: { _id: 'case-003', title: 'ROG Hyperion', specs: 'E-ATX ready' },
          cooling: { _id: 'cool-003', title: 'AIO 360mm Premium', specs: 'Low noise' },
        },
        performance: {
          gpuBrand: 'NVIDIA',
          gpuMemory: '16GB GDDR6X',
          cpuBrand: 'Intel',
          cpuCores: 20,
          cpuThreads: 28,
          totalRam: '64GB DDR5',
          storageCapacity: '2TB NVMe + 4TB HDD',
        },
        certifications: {
          certificate: '80+ Gold',
          wattage: 850,
          manufacturer: 'ASUS',
          modular: 'Full',
        },
        brandLogos: [
          { name: 'Intel', logo: 'assets/img/marcas/Intel-qe15un7mdheilkp4kk4kc0rkl23pw8q1hb0dtjivj2.png' },
          { name: 'NVIDIA', logo: 'assets/img/marcas/Nvidia-qe15uqyz4tjnw0jnylr2lzteyll6r14yttmbqndasi.png' },
          { name: 'ASUS', logo: 'assets/img/marcas/asuspng.png' },
        ],
        customizable: true,
        customizationOptions: {
          ram: ['64GB DDR5', '96GB DDR5'],
          storage: ['2TB NVMe + 4TB HDD', '4TB NVMe + 4TB HDD'],
        },
        warranty: {
          duration: 18,
          type: 'Parts & Labor',
        },
        readyToShip: false,
        estimatedDelivery: { min: 5, max: 9 },
        preBuilt: true,
        freeShipping: true,
        highlights: [
          'Ideal para Premiere, DaVinci y After Effects',
          '64GB DDR5 desde configuracion base',
          'Gabinete premium con gran expansion',
        ],
      },
      {
        _id: 'pc-004',
        id: 4,
        sku: 'PCG-ULTRA-4K',
        category: ProductCategory.ASSEMBLED,
        subcategory: 'pc-workstation',
        status: ProductStatus.ACTIVE,
        title: 'Titan Ultra 4K',
        slug: 'titan-ultra-4k',
        image: 'assets/img/gabinetes/product-section-01.png',
        images: ['assets/img/gabinetes/product-section-01.png'],
        price: 56999,
        currency: 'MXN',
        description:
          'Configuracion premium para 4K, workloads mixtos y sesiones largas con enfoque enthusiast.',
        fullDescription:
          'Pensada para quien quiere una sola maquina para jugar, crear y escalar sin compromisos de plataforma.',
        metaTitle: 'Titan Ultra 4K | Ensamble High-End',
        metaDescription:
          'PC premium con Ryzen 9, RTX 4080 Super y refrigeracion avanzada para gaming y productividad.',
        keywords: ['pc high end', 'rtx 4080 super', 'ryzen 9 gaming'],
        stock: 1,
        lowStockThreshold: 1,
        status_text: 'Ultima unidad',
        featured: true,
        position: 4,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        useCase: UseCase.MIXED,
        performanceTier: PerformanceTier.ULTRA,
        targetAudience: 'Usuarios entusiastas que buscan una maquina tope de gama.',
        specifications: {
          processor: { _id: 'cpu-004', title: 'AMD Ryzen 9 7900X', specs: '12 nucleos / 24 hilos' },
          motherboard: { _id: 'mb-004', title: 'X670E AORUS Elite', specs: 'AM5, PCIe 5.0' },
          ram: { _id: 'ram-004', title: '64GB DDR5 6000MHz', specs: '2x32GB' },
          storage: [
            { _id: 'sto-006', title: '2TB NVMe Gen4', specs: 'Sistema y apps' },
            { _id: 'sto-007', title: '2TB NVMe Gen4', specs: 'Juegos y proyectos' },
          ],
          graphicsCard: { _id: 'gpu-004', title: 'NVIDIA GeForce RTX 4080 Super', specs: '16GB GDDR6X' },
          powerSupply: { _id: 'psu-004', title: '1000W 80+ Gold', specs: 'Full modular' },
          case: { _id: 'case-004', title: 'Premium Showcase Tower', specs: 'Tempered glass' },
          cooling: { _id: 'cool-004', title: 'AIO 360mm push-pull', specs: 'ARGB' },
        },
        performance: {
          gpuBrand: 'NVIDIA',
          gpuMemory: '16GB GDDR6X',
          cpuBrand: 'AMD',
          cpuCores: 12,
          cpuThreads: 24,
          totalRam: '64GB DDR5',
          storageCapacity: '4TB NVMe total',
        },
        certifications: {
          certificate: '80+ Gold',
          wattage: 1000,
          manufacturer: 'Gigabyte',
          modular: 'Full',
        },
        brandLogos: [
          { name: 'AMD', logo: 'assets/img/marcas/AMD-Ryzen.png' },
          { name: 'NVIDIA', logo: 'assets/img/marcas/Nvidia-qe15uqyz4tjnw0jnylr2lzteyll6r14yttmbqndasi.png' },
          { name: 'Gigabyte', logo: 'assets/img/marcas/gigabyte.png' },
        ],
        customizable: true,
        customizationOptions: {
          ram: ['64GB DDR5', '128GB DDR5'],
          storage: ['4TB NVMe', '6TB NVMe'],
          graphicsCard: ['RTX 4080 Super', 'RTX 4090'],
        },
        warranty: {
          duration: 24,
          type: 'Parts & Labor',
        },
        readyToShip: false,
        estimatedDelivery: { min: 7, max: 10 },
        preBuilt: true,
        freeShipping: true,
        highlights: [
          'Pensada para 4K y tareas mixtas',
          '1000W con margen de actualizacion',
          'Configuracion flagship de exhibicion',
        ],
      },
    ];
  }

  private buildComponents(): ComponentProduct[] {
    const baseDate = new Date('2026-04-01T10:00:00');

    return [
      {
        _id: 'cpu-001',
        sku: 'CPU-7600',
        category: ProductCategory.COMPONENT,
        subcategory: 'cpu',
        status: ProductStatus.ACTIVE,
        componentType: 'cpu',
        title: 'AMD Ryzen 5 7600',
        slug: 'amd-ryzen-5-7600',
        image: 'assets/img/marcas/AMD-Ryzen.png',
        price: 4699,
        currency: 'MXN',
        description: 'Procesador AM5 ideal para builds gaming modernas con excelente valor.',
        stock: 8,
        lowStockThreshold: 2,
        published: true,
        featured: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'AMD',
          model: 'Ryzen 5 7600',
          generation: 'Ryzen 7000',
          cores: 6,
          threads: 12,
          baseClock: '3.8 GHz',
          boostClock: '5.1 GHz',
          tdp: 65,
          socket: 'AM5',
          architecture: 'Zen 4',
        },
        compatibility: {
          cpuSocket: ['AM5'],
          notes: 'Ideal para motherboards B650 y X670',
        },
        bestFor: ['Gaming', 'Builds compactas'],
      },
      {
        _id: 'gpu-002',
        sku: 'GPU-4070S',
        category: ProductCategory.COMPONENT,
        subcategory: 'gpu',
        status: ProductStatus.ACTIVE,
        componentType: 'gpu',
        title: 'GeForce RTX 4070 Super',
        slug: 'geforce-rtx-4070-super',
        image: 'assets/img/marcas/Nvidia-qe15uqyz4tjnw0jnylr2lzteyll6r14yttmbqndasi.png',
        price: 13999,
        currency: 'MXN',
        description: 'GPU pensada para 1440p alto y flujos creativos con NVENC moderno.',
        stock: 5,
        lowStockThreshold: 2,
        published: true,
        featured: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'NVIDIA',
          model: 'RTX 4070 Super',
          series: 'RTX 40 Series',
          memorySize: '12GB',
          memoryType: 'GDDR6X',
          memoryBus: '192-bit',
          boostClock: '2.48 GHz',
          cudaCores: 7168,
          tdp: 220,
          interface: 'PCIe 4.0',
          rtx: true,
        },
        compatibility: {
          powerRequirement: 750,
          gpuSlot: 'PCIe 4.0 x16',
        },
        bestFor: ['Gaming 1440p', 'Streaming', 'Edicion'],
      },
      {
        _id: 'ram-003',
        sku: 'RAM-32-DDR5',
        category: ProductCategory.COMPONENT,
        subcategory: 'ram',
        status: ProductStatus.ACTIVE,
        componentType: 'ram',
        title: 'Kingston Fury Beast 32GB DDR5',
        slug: 'kingston-fury-beast-32gb-ddr5',
        image: 'assets/img/marcas/kingston.png',
        price: 2899,
        currency: 'MXN',
        description: 'Kit DDR5 balanceado para gaming y productividad en plataforma moderna.',
        stock: 12,
        lowStockThreshold: 3,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Kingston',
          model: 'Fury Beast',
          type: 'DDR5',
          capacity: '32GB',
          speed: '6000MHz',
          formFactor: 'DIMM',
          modules: 2,
          heatsink: true,
          lightningRgb: false,
        },
        compatibility: {
          ramType: ['DDR5'],
        },
        bestFor: ['Gaming', 'Streaming', 'Multitarea'],
      },
      {
        _id: 'sto-004',
        sku: 'SSD-2TB-G4',
        category: ProductCategory.COMPONENT,
        subcategory: 'storage',
        status: ProductStatus.ACTIVE,
        componentType: 'storage',
        title: 'NVMe Gen4 2TB Performance',
        slug: 'nvme-gen4-2tb-performance',
        image: 'assets/img/marcas/MSI-qe15ugmr1n5icayomza6ckfcfd05eczx4efzglsmlc.png',
        price: 3199,
        currency: 'MXN',
        description: 'Unidad NVMe de alta velocidad para bibliotecas de juegos y proyectos pesados.',
        stock: 9,
        lowStockThreshold: 2,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'MSI',
          model: 'Spatium Performance',
          type: 'NVMe',
          capacity: '2TB',
          interface: 'PCIe 4.0',
          speed: '7000MB/s',
          formFactor: 'M.2 2280',
          warranty: '5 anos',
        },
        bestFor: ['Gaming', 'Edicion', 'Bibliotecas grandes'],
      },
    ];
  }

  private buildPeripherals(): PeripheralProduct[] {
    const baseDate = new Date('2026-04-01T10:00:00');

    return [
      {
        _id: 'per-001',
        sku: 'KB-K95',
        category: ProductCategory.PERIPHERAL,
        subcategory: 'keyboard',
        status: ProductStatus.ACTIVE,
        peripheralType: 'keyboard',
        title: 'Corsair K95 RGB Platinum XT',
        slug: 'corsair-k95-rgb-platinum-xt',
        image: 'assets/img/marcas/corsairbrand.png',
        price: 3299,
        currency: 'MXN',
        description: 'Teclado premium para gaming, macros y setups de streaming.',
        stock: 6,
        lowStockThreshold: 2,
        published: true,
        featured: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Corsair',
          model: 'K95 RGB Platinum XT',
          keyType: 'Mechanical',
          keySwitch: 'Cherry MX Speed',
          layout: 'Full Size',
          backlight: 'RGB',
          connectionType: 'Wired',
          macros: true,
          programmable: true,
        },
        features: ['RGB', 'Macros dedicadas', 'USB passthrough'],
        bestFor: ['MMO', 'Streaming', 'Productividad'],
      },
      {
        _id: 'per-002',
        sku: 'MS-GPRO',
        category: ProductCategory.PERIPHERAL,
        subcategory: 'mouse',
        status: ProductStatus.ACTIVE,
        peripheralType: 'mouse',
        title: 'Logitech G Pro X Superlight',
        slug: 'logitech-g-pro-x-superlight',
        image: 'assets/img/marcas/Logitech.png',
        price: 2699,
        currency: 'MXN',
        description: 'Mouse ultraligero para juego competitivo con enfoque en precision y respuesta.',
        stock: 10,
        lowStockThreshold: 3,
        published: true,
        featured: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Logitech',
          model: 'G Pro X Superlight',
          dpi: { min: 100, max: 25600 },
          sensor: 'HERO 25K',
          buttons: 5,
          gripType: 'Universal',
          weight: '63g',
          connectionType: '2.4GHz Wireless',
          batteryLife: '70 horas',
          polling: 1000,
        },
        features: ['Wireless', 'Ultralight', 'Sensor HERO'],
        bestFor: ['FPS', 'Competitivo'],
      },
      {
        _id: 'per-003',
        sku: 'MN-27Q',
        category: ProductCategory.PERIPHERAL,
        subcategory: 'monitor',
        status: ProductStatus.ACTIVE,
        peripheralType: 'monitor',
        title: 'Gigabyte M27Q 27"',
        slug: 'gigabyte-m27q-27',
        image: 'assets/img/marcas/gigabyte.png',
        price: 6299,
        currency: 'MXN',
        description: 'Monitor QHD de 170Hz para setups gaming y productividad creativa.',
        stock: 4,
        lowStockThreshold: 2,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Gigabyte',
          model: 'M27Q',
          size: '27 pulgadas',
          sizeInches: 27,
          resolution: '2560x1440',
          panelType: 'IPS',
          refreshRate: 170,
          responseTime: 1,
          responseTimeType: 'MPRT',
          hdmi: 2,
          displayPort: 1,
          brightness: 350,
          gsync: true,
          freesync: true,
          hdr: true,
        },
        features: ['QHD', '170Hz', 'IPS'],
        bestFor: ['Gaming 1440p', 'Setups mixtos'],
      },
      {
        _id: 'per-004',
        sku: 'HS-HX3',
        category: ProductCategory.PERIPHERAL,
        subcategory: 'headset',
        status: ProductStatus.ACTIVE,
        peripheralType: 'headset',
        title: 'HyperX Cloud III Wireless',
        slug: 'hyperx-cloud-iii-wireless',
        image: 'assets/img/marcas/hyperx.png',
        price: 2999,
        currency: 'MXN',
        description: 'Headset comodo para sesiones largas, chat claro y uso multiplataforma.',
        stock: 7,
        lowStockThreshold: 2,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'HyperX',
          model: 'Cloud III Wireless',
          type: 'Over-Ear',
          driver: '53mm',
          frequencyRange: '10Hz-21kHz',
          connectionType: '2.4GHz Wireless',
          batteryLife: '120 horas',
          microphone: true,
          surround: 'DTS Headphone:X',
          compatible: ['PC', 'PS5'],
        },
        features: ['Wireless', 'Bateria extendida', 'Microfono desmontable'],
        bestFor: ['Streaming', 'Gaming casual', 'FPS'],
      },
    ];
  }
}
