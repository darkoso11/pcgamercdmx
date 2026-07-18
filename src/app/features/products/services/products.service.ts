import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DirectusApiService } from '../../../core/services/directus-api.service';
import {
  DirectusProductRecord,
  mapDirectusProductToCatalogProduct,
} from '../../../core/services/directus-content.mapper';
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
  inStock: boolean;
  inventoryLabel: string;
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
  private readonly assembledPCs: AssembledPC[] = [];
  private readonly components = this.buildComponents();
  private readonly peripherals = this.buildPeripherals();
  private readonly accessories = this.buildAccessories();

  constructor(private readonly directus: DirectusApiService) {}

  getAssembledPCs(filters?: FilterCriteria): Observable<AssembledPC[]> {
    return this.getCatalogProducts({
      ...filters,
      categories: [ProductCategory.ASSEMBLED],
    }).pipe(
      map((products) =>
        products.filter(
          (product): product is AssembledPC =>
            product.category === ProductCategory.ASSEMBLED
        )
      )
    );
  }

  getComponentsByType(
    type?: ComponentType,
    filters?: FilterCriteria
  ): Observable<ComponentProduct[]> {
    return this.getCatalogProducts({
      ...filters,
      categories: [ProductCategory.COMPONENT],
    }).pipe(
      map((products) =>
        products
          .filter(
            (product): product is ComponentProduct =>
              product.category === ProductCategory.COMPONENT
          )
          .filter((product) => !type || product.componentType === type)
      )
    );
  }

  getPeripherals(
    type?: PeripheralType,
    filters?: FilterCriteria
  ): Observable<PeripheralProduct[]> {
    return this.getCatalogProducts({
      ...filters,
      categories: [ProductCategory.PERIPHERAL],
    }).pipe(
      map((products) =>
        products
          .filter(
            (product): product is PeripheralProduct =>
              product.category === ProductCategory.PERIPHERAL
          )
          .filter((product) => !type || product.peripheralType === type)
      )
    );
  }

  getHardwareAndAccessories(
    filters?: FilterCriteria
  ): Observable<Array<ComponentProduct | AccessoryProduct>> {
    return this.getCatalogProducts({
      ...filters,
      categories: [ProductCategory.COMPONENT, ProductCategory.ACCESSORY],
    }).pipe(
      map((products) =>
        products.filter(
          (product): product is ComponentProduct | AccessoryProduct =>
            product.category === ProductCategory.COMPONENT ||
            product.category === ProductCategory.ACCESSORY
        )
      )
    );
  }

  getCatalogProducts(filters?: FilterCriteria): Observable<CatalogProduct[]> {
    return this.loadCatalogProducts().pipe(
      map((products) => this.applyFilters(products, filters))
    );
  }

  getFeaturedCatalogProducts(limit = 6): Observable<CatalogProduct[]> {
    return this.loadCatalogProducts().pipe(
      map((products) =>
        products
          .filter((product) => product.featured)
          .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
          .slice(0, limit)
      )
    );
  }

  getCatalogProductBySlug(slug: string): Observable<CatalogProduct | null> {
    return this.loadCatalogProducts().pipe(
      map((products) => products.find((item) => item.slug === slug) ?? null)
    );
  }

  getRelatedCatalogProducts(
    slug: string,
    limit = 4
  ): Observable<CatalogProduct[]> {
    return this.loadCatalogProducts().pipe(
      map((products) => {
        const current = products.find((item) => item.slug === slug);
        if (!current) {
          return [];
        }

        return products
          .filter((item) => item.slug !== slug && item.category === current.category)
          .sort((a, b) => {
            const featuredWeight = Number(b.featured) - Number(a.featured);
            if (featuredWeight !== 0) {
              return featuredWeight;
            }
            return a.title.localeCompare(b.title);
          })
          .slice(0, limit);
      })
    );
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

    return this.loadCatalogProducts().pipe(
      map((products) => ({
        assembled: filterByQuery(
          products.filter(
            (product): product is AssembledPC =>
              product.category === ProductCategory.ASSEMBLED
          )
        ).slice(0, limit),
        components: filterByQuery(
          products.filter(
            (product): product is ComponentProduct =>
              product.category === ProductCategory.COMPONENT
          )
        ).slice(0, limit),
        peripherals: filterByQuery(
          products.filter(
            (product): product is PeripheralProduct =>
              product.category === ProductCategory.PERIPHERAL
          )
        ).slice(0, limit),
        accessories: filterByQuery(
          products.filter(
            (product): product is AccessoryProduct =>
              product.category === ProductCategory.ACCESSORY
          )
        ).slice(0, limit),
      }))
    );
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
      inStock: product.stock > 0,
      inventoryLabel: this.buildInventoryLabel(product),
    };
  }

  getCategoryLabel(category: ProductCategory): string {
    switch (category) {
      case ProductCategory.ASSEMBLED:
        return 'Ensambles';
      case ProductCategory.COMPONENT:
        return 'Hardware y accesorios';
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
        return '/productos/hardware-accesorios';
      case ProductCategory.PERIPHERAL:
        return '/productos/perifericos';
      case ProductCategory.ACCESSORY:
        return '/productos/hardware-accesorios';
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

    if (product.category === ProductCategory.ACCESSORY) {
      const specs = product.specifications;
      const details = [
        { label: 'Marca', value: specs.brand },
        { label: 'Modelo', value: specs.model },
      ];

      if ('type' in specs) {
        details.push({ label: 'Tipo', value: specs.type });
      }

      if ('length' in specs && specs.length) {
        details.push({ label: 'Longitud', value: specs.length });
      }

      if ('ports' in specs) {
        details.push({ label: 'Puertos', value: `${specs.ports}` });
      }

      if ('connection' in specs && specs.connection) {
        details.push({ label: 'Conexion', value: specs.connection });
      }

      return details.slice(0, limit);
    }

    return [];
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

  private loadCatalogProducts(): Observable<CatalogProduct[]> {
    const fallback = this.getAllCatalogProducts();

    if (!this.directus.isEnabled('catalog')) {
      return of(fallback);
    }

    return this.directus
      .readItems<DirectusProductRecord>('pc_products', {
        'filter[published][_eq]': true,
        fields: '*',
        sort: 'sort,title',
        limit: 1000,
      })
      .pipe(
        map((response) => {
          const products = response.data.map(mapDirectusProductToCatalogProduct);
          return products.length ? products : fallback;
        }),
        catchError(() => of(fallback))
      );
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

    if (product.stock <= 0) {
      badges.push('Sin stock');
    }

    if (product.featured) {
      badges.push('Destacado');
    }

    if (product.discountedPrice) {
      badges.push('Promocion');
    }

    if (product.stock > 0 && product.stock <= (product.lowStockThreshold ?? 2)) {
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

    if (product.category === ProductCategory.ACCESSORY) {
      badges.push(this.formatLabel(product.accessoryType));
    }

    return badges.slice(0, 4);
  }

  private buildInventoryLabel(product: CatalogProduct): string {
    if (product.stock <= 0) {
      return 'Producto sin stock';
    }

    if (product.stock <= 1) {
      return 'Ultima unidad disponible';
    }

    if (product.stock <= (product.lowStockThreshold ?? 2)) {
      return 'Inventario limitado';
    }

    return 'Disponible';
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

  private buildAccessories(): AccessoryProduct[] {
    const baseDate = new Date('2026-04-01T10:00:00');

    return [
      {
        _id: 'acc-001',
        sku: 'CB-HDMI-8K-3M',
        category: ProductCategory.ACCESSORY,
        subcategory: 'cable',
        status: ProductStatus.ACTIVE,
        accessoryType: 'cable',
        title: 'Cable HDMI 2.1 8K 3m',
        slug: 'cable-hdmi-2-1-8k-3m',
        image: 'assets/img/marcas/thermaltake.png',
        price: 349,
        currency: 'MXN',
        description: 'Cable HDMI de alta velocidad para monitores, consolas y tarjetas graficas modernas.',
        stock: 18,
        lowStockThreshold: 4,
        published: true,
        featured: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Manhattan',
          model: 'HDMI 2.1 8K',
          type: 'HDMI',
          standard: '2.1',
          length: '3m',
          shielded: true,
          braided: true,
          color: 'Negro',
          connectorType: 'HDMI macho a macho',
        },
        compatibility: {
          devices: ['PC', 'Monitor', 'TV', 'Consola'],
          notes: 'Soporta altas tasas de refresco segun equipo y pantalla.',
        },
        bundleReady: true,
      },
      {
        _id: 'acc-002',
        sku: 'AD-USBC-DP',
        category: ProductCategory.ACCESSORY,
        subcategory: 'usb-hub',
        status: ProductStatus.ACTIVE,
        accessoryType: 'usb-hub',
        title: 'Adaptador USB-C a DisplayPort',
        slug: 'adaptador-usb-c-displayport',
        image: 'assets/img/marcas/Logitech.png',
        price: 599,
        currency: 'MXN',
        description: 'Adaptador compacto para conectar laptops y PCs con USB-C a pantallas DisplayPort.',
        stock: 9,
        lowStockThreshold: 2,
        published: true,
        featured: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Manhattan',
          model: 'USB-C DP Adapter',
          ports: 1,
          portTypes: ['DisplayPort'],
          maxDataRate: '4K 60Hz',
          powerDelivery: false,
          material: 'Aluminio',
          connection: 'USB-C',
        },
        compatibility: {
          devices: ['Laptop', 'PC', 'Monitor DisplayPort'],
        },
        bundleReady: true,
      },
      {
        _id: 'acc-003',
        sku: 'HUB-USBC-6IN1',
        category: ProductCategory.ACCESSORY,
        subcategory: 'usb-hub',
        status: ProductStatus.ACTIVE,
        accessoryType: 'usb-hub',
        title: 'Hub USB-C 6 en 1',
        slug: 'hub-usb-c-6-en-1',
        image: 'assets/img/marcas/corsairbrand.png',
        price: 899,
        currency: 'MXN',
        description: 'Hub para escritorios compactos con USB, HDMI y carga de paso para setups diarios.',
        stock: 11,
        lowStockThreshold: 3,
        published: true,
        createdAt: baseDate,
        updatedAt: baseDate,
        specifications: {
          brand: 'Acteck',
          model: 'USB-C 6 en 1',
          ports: 6,
          portTypes: ['USB-A', 'USB-C', 'HDMI', 'SD'],
          maxDataRate: '5Gbps',
          powerDelivery: true,
          powerDeliveryWatts: 100,
          material: 'Aluminio',
          connection: 'USB-C',
        },
        compatibility: {
          devices: ['Laptop', 'PC', 'Tablet USB-C'],
        },
        bundleReady: true,
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
