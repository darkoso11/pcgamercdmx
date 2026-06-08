import {
  ProductCategory,
  ProductStatus,
  PerformanceTier,
  UseCase,
} from '../../shared/models';
import type { CatalogProduct } from '../../features/products/services/products.service';
import type {
  Category as AdminCategory,
  Product as AdminProduct,
  Subcategory as AdminSubcategory,
} from '../../features/products/admin/shared/products-admin.service';
import type {
  Article,
  Category as BlogCategory,
  SubCategory as BlogSubCategory,
} from '../../features/blog/models/types';

export interface DirectusProductRecord {
  id?: number | string;
  title?: string;
  slug?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: number | string | null;
  discounted_price?: number | string | null;
  image?: string;
  images?: unknown;
  specifications?: Record<string, unknown> | null;
  brand_logos?: unknown;
  stock?: number | string | null;
  low_stock_alert?: number | string | null;
  featured?: boolean | null;
  published?: boolean | null;
  sort?: number | string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords?: unknown;
}

export interface DirectusProductPayload {
  title: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  discounted_price: number | null;
  image: string;
  images: string[];
  specifications: Record<string, unknown>;
  brand_logos: unknown[];
  stock: number;
  low_stock_alert: number;
  featured: boolean;
  published: boolean;
  sort?: number | null;
  meta_title?: string | null;
  meta_description?: string | null;
  keywords: string[];
}

export interface DirectusCategoryRecord {
  id?: number | string;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  sort?: number | string | null;
  published?: boolean | null;
}

export interface DirectusSubcategoryRecord {
  id?: number | string;
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  category_id?: number | string | null;
  category_slug?: string | null;
  sort?: number | string | null;
  published?: boolean | null;
}

export interface DirectusBlogPostRecord {
  id?: number | string;
  title?: string;
  slug?: string;
  summary?: string | null;
  cover_image?: unknown;
  sections?: unknown;
  category?: string | null;
  subcategory?: string | null;
  tags?: unknown;
  published?: boolean | null;
  published_at?: string | null;
  sort?: number | string | null;
}

export interface DirectusBlogPostPayload {
  title: string;
  slug: string;
  summary: string | null;
  cover_image: unknown;
  sections: unknown[];
  category: string | null;
  subcategory: string | null;
  tags: string[];
  published: boolean;
  published_at: string | null;
  sort?: number | null;
}

const DEFAULT_IMAGE = 'https://placehold.co/900x700/101633/67e8f9?text=PC+Gamer+CDMX';

export function mapDirectusProductToAdminProduct(
  item: DirectusProductRecord
): AdminProduct {
  const specs = toRecord(item.specifications);
  const admin = toRecord(specs['admin']);
  const catalog = toRecord(specs['catalog']);
  const category = directusCategoryToAdmin(item.category ?? catalog['category']);
  const images = normalizeStringArray(item.images);
  const gallery = normalizeStringArray(admin['gallery']).length
    ? normalizeStringArray(admin['gallery'])
    : images;

  return {
    _id: idToString(item.id),
    title: text(item.title ?? catalog['title'], 'Producto sin titulo'),
    slug: text(item.slug ?? catalog['slug'], ''),
    description: text(item.description ?? catalog['description'], ''),
    category,
    price: toNumber(item.price),
    discountedPrice: optionalNumber(item.discounted_price),
    discountPrice: optionalNumber(admin['discountPrice'] ?? item.discounted_price),
    discountPercent: optionalNumber(admin['discountPercent']),
    processor: text(specs['processor'] ?? readNested(catalog, ['specifications', 'processor', 'title']), ''),
    motherboard: text(specs['motherboard'] ?? readNested(catalog, ['specifications', 'motherboard', 'title']), ''),
    ram: text(specs['ram'] ?? readNested(catalog, ['specifications', 'ram', 'title']), ''),
    storage: text(specs['storage'] ?? readNested(catalog, ['performance', 'storageCapacity']), ''),
    graphicsCard: text(specs['graphicsCard'] ?? readNested(catalog, ['specifications', 'graphicsCard', 'title']), ''),
    powerSupply: text(specs['powerSupply'] ?? readNested(catalog, ['specifications', 'powerSupply', 'title']), ''),
    caseModel: text(specs['caseModel'] ?? readNested(catalog, ['specifications', 'case', 'title']), ''),
    cooling: text(specs['cooling'] ?? readNested(catalog, ['specifications', 'cooling', 'title']), ''),
    image: text(item.image ?? catalog['image'], DEFAULT_IMAGE),
    images,
    gallery,
    powerCertificate: text(specs['powerCertificate'] ?? readNested(catalog, ['certifications', 'certificate']), ''),
    watts: optionalNumber(specs['watts'] ?? readNested(catalog, ['certifications', 'wattage'])),
    brandLogos: mapBrandLogosToAdmin(item.brand_logos ?? catalog['brandLogos']),
    stock: toNumber(item.stock),
    lowStockAlert: toNumber(item.low_stock_alert, 2),
    metaTitle: text(item.meta_title, ''),
    metaDescription: text(item.meta_description, ''),
    keywords: normalizeStringArray(item.keywords),
    published: Boolean(item.published),
    featured: Boolean(item.featured),
    productType: text(admin['productType'], defaultProductType(category)),
    brand: text(admin['brand'] ?? guessBrandFromCatalog(catalog), ''),
    categoryId: text(admin['categoryId'], text(item.category, '')),
    subcategoryId: text(admin['subcategoryId'], text(item.subcategory, '')),
    currency: text(admin['currency'], 'MXN'),
    sku: text(admin['sku'] ?? catalog['sku'], ''),
    pricingMode: text(admin['pricingMode'], 'manual') as any,
    syncEnabled: Boolean(admin['syncEnabled']),
    syncProvider: text(admin['syncProvider'], ''),
    providerProductId: text(admin['providerProductId'], ''),
    providerSku: text(admin['providerSku'], ''),
    lastPriceSyncedAt: text(admin['lastPriceSyncedAt'], ''),
    lastSyncStatus: text(admin['lastSyncStatus'], ''),
    lastSyncError: text(admin['lastSyncError'], ''),
    modelo: text(admin['modelo'], ''),
    tipo: text(admin['tipo'], ''),
    conexion: text(admin['conexion'], ''),
    tamaño: text(admin['tamaño'], ''),
    material: text(admin['material'], ''),
    puertos: text(admin['puertos'], ''),
    especificacionPersonalizada: text(admin['especificacionPersonalizada'], ''),
    internalNotes: text(admin['internalNotes'], ''),
    createdAt: toDate(admin['createdAt'] ?? catalog['createdAt']),
    updatedAt: toDate(admin['updatedAt'] ?? catalog['updatedAt']),
  };
}

export function mapAdminProductToDirectusPayload(
  product: Partial<AdminProduct>
): DirectusProductPayload {
  const category = adminCategoryToDirectus(product.category);
  const adminMetadata = {
    productType: product.productType ?? defaultProductType(product.category),
    brand: product.brand ?? '',
    categoryId: product.categoryId ?? '',
    subcategoryId: product.subcategoryId ?? '',
    discountPrice: product.discountPrice ?? product.discountedPrice ?? null,
    discountPercent: product.discountPercent ?? null,
    currency: product.currency ?? 'MXN',
    sku: product.sku ?? '',
    pricingMode: product.pricingMode ?? 'manual',
    syncEnabled: product.pricingMode === 'provider',
    syncProvider: product.syncProvider ?? '',
    providerProductId: product.providerProductId ?? '',
    providerSku: product.providerSku ?? '',
    lastPriceSyncedAt: product.lastPriceSyncedAt ?? null,
    lastSyncStatus: product.lastSyncStatus ?? null,
    lastSyncError: product.lastSyncError ?? null,
    gallery: product.gallery ?? product.images ?? [],
    modelo: product.modelo ?? '',
    tipo: product.tipo ?? '',
    conexion: product.conexion ?? '',
    tamaño: product.tamaño ?? '',
    material: product.material ?? '',
    puertos: product.puertos ?? '',
    especificacionPersonalizada: product.especificacionPersonalizada ?? '',
    internalNotes: product.internalNotes ?? '',
    createdAt: serializeDate(product.createdAt),
    updatedAt: new Date().toISOString(),
  };

  return {
    title: text(product.title, 'Producto sin titulo'),
    slug: text(product.slug, slugify(text(product.title, 'producto'))),
    description: text(product.description, ''),
    category,
    subcategory: text(product.subcategoryId ?? product.categoryId, category),
    price: toNumber(product.price),
    discounted_price: positiveOptionalNumber(product.discountedPrice ?? product.discountPrice),
    image: text(product.image, DEFAULT_IMAGE),
    images: normalizeStringArray(product.images ?? product.gallery),
    specifications: {
      processor: product.processor ?? '',
      motherboard: product.motherboard ?? '',
      ram: product.ram ?? '',
      storage: product.storage ?? '',
      graphicsCard: product.graphicsCard ?? '',
      powerSupply: product.powerSupply ?? '',
      caseModel: product.caseModel ?? '',
      cooling: product.cooling ?? '',
      powerCertificate: product.powerCertificate ?? '',
      watts: product.watts ?? null,
      admin: adminMetadata,
    },
    brand_logos: product.brandLogos ?? [],
    stock: toNumber(product.stock),
    low_stock_alert: toNumber(product.lowStockAlert, 2),
    featured: Boolean(product.featured),
    published: Boolean(product.published),
    meta_title: text(product.metaTitle, '') || null,
    meta_description: text(product.metaDescription, '') || null,
    keywords: normalizeStringArray(product.keywords),
  };
}

export function mapCatalogProductToDirectusPayload(
  product: CatalogProduct
): DirectusProductPayload {
  const serializedCatalog = JSON.parse(JSON.stringify(product)) as Record<string, unknown>;
  const specifications = {
    ...buildCatalogSpecSummary(product),
    catalog: serializedCatalog,
  };

  return {
    title: product.title,
    slug: product.slug,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
    price: product.price,
    discounted_price: positiveOptionalNumber(product.discountedPrice),
    image: product.image,
    images: normalizeStringArray(product.images),
    specifications,
    brand_logos: normalizeBrandLogos(product),
    stock: product.stock,
    low_stock_alert: product.lowStockThreshold ?? 2,
    featured: Boolean(product.featured),
    published: Boolean(product.published),
    sort: product.position ?? product.id ?? 999,
    meta_title: product.metaTitle ?? null,
    meta_description: product.metaDescription ?? null,
    keywords: normalizeStringArray(product.keywords),
  };
}

export function mapDirectusProductToCatalogProduct(
  item: DirectusProductRecord
): CatalogProduct {
  const specs = toRecord(item.specifications);
  const catalog = toRecord(specs['catalog']);

  if (Object.keys(catalog).length > 0) {
    return {
      ...catalog,
      _id: idToString(item.id) || text(catalog['_id'], ''),
      id: optionalNumber(item.id) ?? optionalNumber(catalog['id']),
      title: text(item.title ?? catalog['title'], 'Producto sin titulo'),
      slug: text(item.slug ?? catalog['slug'], ''),
      description: text(item.description ?? catalog['description'], ''),
      category: normalizeProductCategory(item.category ?? catalog['category']),
      subcategory: text(item.subcategory ?? catalog['subcategory'], ''),
      image: text(item.image ?? catalog['image'], DEFAULT_IMAGE),
      images: normalizeStringArray(item.images ?? catalog['images']),
      price: toNumber(item.price ?? catalog['price']),
      discountedPrice: optionalNumber(item.discounted_price ?? catalog['discountedPrice']),
      stock: toNumber(item.stock ?? catalog['stock']),
      lowStockThreshold: optionalNumber(item.low_stock_alert ?? catalog['lowStockThreshold']),
      featured: Boolean(item.featured ?? catalog['featured']),
      published: Boolean(item.published ?? catalog['published']),
      position: optionalNumber(item.sort ?? catalog['position']) ?? undefined,
      metaTitle: text(item.meta_title ?? catalog['metaTitle'], ''),
      metaDescription: text(item.meta_description ?? catalog['metaDescription'], ''),
      keywords: normalizeStringArray(item.keywords ?? catalog['keywords']),
      createdAt: toDate(catalog['createdAt']),
      updatedAt: toDate(catalog['updatedAt']),
    } as CatalogProduct;
  }

  const category = normalizeProductCategory(item.category);
  if (category === ProductCategory.COMPONENT) {
    return buildFallbackComponentProduct(item, specs);
  }

  if (category === ProductCategory.PERIPHERAL) {
    return buildFallbackPeripheralProduct(item, specs);
  }

  return buildFallbackAssembledProduct(item, specs);
}

export function mapDirectusBlogPostToArticle(
  item: DirectusBlogPostRecord
): Article {
  return {
    _id: idToString(item.id),
    title: text(item.title, 'Articulo sin titulo'),
    slug: text(item.slug, ''),
    summary: text(item.summary, ''),
    coverImage: normalizeCoverImage(item.cover_image),
    sections: normalizeArray(item.sections),
    categoryId: text(item.category, ''),
    subCategoryId: text(item.subcategory, ''),
    tags: normalizeStringArray(item.tags),
    published: Boolean(item.published),
    publishedAt: text(item.published_at, ''),
    createdAt: text(item.published_at, ''),
    updatedAt: text(item.published_at, ''),
  };
}

export function mapArticleToDirectusPayload(
  article: Partial<Article> & { coverImage?: unknown }
): DirectusBlogPostPayload {
  return {
    title: text(article.title, 'Articulo sin titulo'),
    slug: text(article.slug, slugify(text(article.title, 'articulo'))),
    summary: text(article.summary, '') || null,
    cover_image: normalizeCoverImage(article.coverImage),
    sections: normalizeArray(article.sections),
    category: text(article.categoryId, '') || null,
    subcategory: text(article.subCategoryId, '') || null,
    tags: normalizeStringArray(article.tags),
    published: Boolean(article.published),
    published_at: article.published
      ? text(article.publishedAt, new Date().toISOString())
      : text(article.publishedAt, '') || null,
  };
}

export function mapDirectusCategoryToBlogCategory(
  item: DirectusCategoryRecord
): BlogCategory {
  return {
    _id: idToString(item.id),
    name: text(item.name, ''),
    description: text(item.description, ''),
  };
}

export function mapDirectusSubcategoryToBlogSubcategory(
  item: DirectusSubcategoryRecord
): BlogSubCategory {
  return {
    _id: idToString(item.id),
    name: text(item.name, ''),
    categoryId: text(item.category_id ?? item.category_slug, ''),
    description: text(item.description, ''),
  };
}

export function mapBlogCategoryToDirectusPayload(
  category: Partial<BlogCategory>
): Partial<DirectusCategoryRecord> {
  return {
    name: text(category.name, 'Categoria'),
    slug: slugify(text(category.name, 'categoria')),
    description: text(category.description, ''),
    icon: 'folder',
    published: true,
  };
}

export function mapBlogSubcategoryToDirectusPayload(
  subcategory: Partial<BlogSubCategory>
): Partial<DirectusSubcategoryRecord> {
  return {
    name: text(subcategory.name, 'Subcategoria'),
    slug: slugify(text(subcategory.name, 'subcategoria')),
    description: text(subcategory.description, ''),
    category_id: text(subcategory.categoryId, ''),
    category_slug: text(subcategory.categoryId, ''),
    published: true,
  };
}

export function mapDirectusCategoryToAdminCategory(
  item: DirectusCategoryRecord,
  subcategories: AdminSubcategory[] = [],
  productCount = 0
): AdminCategory {
  return {
    _id: idToString(item.id),
    name: text(item.name, ''),
    slug: text(item.slug, ''),
    description: text(item.description, ''),
    icon: text(item.icon, 'fa-folder'),
    order: toNumber(item.sort),
    subcategories,
    productCount,
  };
}

export function mapDirectusSubcategoryToAdminSubcategory(
  item: DirectusSubcategoryRecord
): AdminSubcategory {
  return {
    _id: idToString(item.id),
    name: text(item.name, ''),
    slug: text(item.slug, ''),
    description: text(item.description, ''),
    icon: text(item.icon, 'fa-folder'),
    productCount: 0,
  };
}

export function mapAdminCategoryToDirectusPayload(
  category: Partial<AdminCategory>
): Partial<DirectusCategoryRecord> {
  return {
    name: text(category.name, 'Categoria'),
    slug: text(category.slug, slugify(text(category.name, 'categoria'))),
    description: text(category.description, ''),
    icon: text(category.icon, 'fa-folder'),
    sort: category.order ?? null,
    published: true,
  };
}

export function mapAdminSubcategoryToDirectusPayload(
  categoryId: string,
  categorySlug: string,
  subcategory: Partial<AdminSubcategory>
): Partial<DirectusSubcategoryRecord> {
  return {
    name: text(subcategory.name, 'Subcategoria'),
    slug: text(subcategory.slug, slugify(text(subcategory.name, 'subcategoria'))),
    description: text(subcategory.description, ''),
    icon: text(subcategory.icon, 'fa-folder'),
    category_id: categoryId,
    category_slug: categorySlug,
    published: true,
  };
}

export function adminCategoryToDirectus(
  category?: AdminProduct['category'] | string
): ProductCategory {
  switch (category) {
    case 'paquetes':
    case 'ensambles':
    case ProductCategory.ASSEMBLED:
      return ProductCategory.ASSEMBLED;
    case 'componentes':
    case ProductCategory.COMPONENT:
      return ProductCategory.COMPONENT;
    case 'perifericos':
    case ProductCategory.PERIPHERAL:
      return ProductCategory.PERIPHERAL;
    default:
      return ProductCategory.COMPONENT;
  }
}

export function directusCategoryToAdmin(value: unknown): AdminProduct['category'] {
  switch (value) {
    case ProductCategory.ASSEMBLED:
    case 'ensambles':
    case 'paquetes':
      return 'paquetes';
    case ProductCategory.PERIPHERAL:
    case 'perifericos':
      return 'perifericos';
    case ProductCategory.COMPONENT:
    case 'componentes':
    default:
      return 'componentes';
  }
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildFallbackAssembledProduct(
  item: DirectusProductRecord,
  specs: Record<string, unknown>
): CatalogProduct {
  const processor = componentRef('cpu', specs['processor']);
  const graphicsCard = componentRef('gpu', specs['graphicsCard']);
  const ram = componentRef('ram', specs['ram']);
  const storage = componentRef('storage', specs['storage']);
  const powerSupply = componentRef('psu', specs['powerSupply']);
  const wattage = optionalNumber(specs['watts']) ?? extractWattage(powerSupply.title) ?? 650;

  return {
    _id: idToString(item.id),
    id: optionalNumber(item.id),
    sku: '',
    category: ProductCategory.ASSEMBLED,
    subcategory: text(item.subcategory, 'pc-gaming'),
    status: ProductStatus.ACTIVE,
    title: text(item.title, 'Producto sin titulo'),
    slug: text(item.slug, ''),
    image: text(item.image, DEFAULT_IMAGE),
    images: normalizeStringArray(item.images),
    price: toNumber(item.price),
    discountedPrice: optionalNumber(item.discounted_price),
    currency: 'MXN',
    description: text(item.description, ''),
    fullDescription: text(item.description, ''),
    metaTitle: text(item.meta_title, ''),
    metaDescription: text(item.meta_description, ''),
    keywords: normalizeStringArray(item.keywords),
    stock: toNumber(item.stock),
    lowStockThreshold: toNumber(item.low_stock_alert, 2),
    featured: Boolean(item.featured),
    position: optionalNumber(item.sort) ?? undefined,
    published: Boolean(item.published),
    createdAt: new Date(),
    updatedAt: new Date(),
    useCase: UseCase.GAMING,
    performanceTier: PerformanceTier.MID,
    specifications: {
      processor,
      motherboard: componentRef('motherboard', specs['motherboard']),
      ram,
      storage: [storage],
      graphicsCard,
      powerSupply,
      case: componentRef('case', specs['caseModel']),
      cooling: componentRef('cooling', specs['cooling']),
    },
    performance: {
      gpuBrand: guessGpuBrand(graphicsCard.title),
      gpuMemory: '',
      cpuBrand: guessCpuBrand(processor.title),
      cpuCores: 0,
      totalRam: ram.title,
      storageCapacity: storage.title,
    },
    certifications: {
      certificate: text(specs['powerCertificate'], '80+ Gold') as any,
      wattage,
    },
    brandLogos: mapBrandLogosToCatalog(item.brand_logos),
  } as CatalogProduct;
}

function buildFallbackComponentProduct(
  item: DirectusProductRecord,
  specs: Record<string, unknown>
): CatalogProduct {
  return {
    _id: idToString(item.id),
    sku: '',
    category: ProductCategory.COMPONENT,
    subcategory: text(item.subcategory, 'component'),
    status: ProductStatus.ACTIVE,
    componentType: text(item.subcategory, 'cpu') as any,
    title: text(item.title, 'Producto sin titulo'),
    slug: text(item.slug, ''),
    image: text(item.image, DEFAULT_IMAGE),
    images: normalizeStringArray(item.images),
    price: toNumber(item.price),
    discountedPrice: optionalNumber(item.discounted_price),
    currency: 'MXN',
    description: text(item.description, ''),
    fullDescription: text(item.description, ''),
    stock: toNumber(item.stock),
    lowStockThreshold: toNumber(item.low_stock_alert, 2),
    featured: Boolean(item.featured),
    published: Boolean(item.published),
    createdAt: new Date(),
    updatedAt: new Date(),
    specifications: {
      brand: text(specs['brand'], ''),
      model: text(specs['model'] ?? item.title, ''),
      ...specs,
    },
    bestFor: normalizeStringArray(specs['bestFor']),
  } as CatalogProduct;
}

function buildFallbackPeripheralProduct(
  item: DirectusProductRecord,
  specs: Record<string, unknown>
): CatalogProduct {
  return {
    _id: idToString(item.id),
    sku: '',
    category: ProductCategory.PERIPHERAL,
    subcategory: text(item.subcategory, 'peripheral'),
    status: ProductStatus.ACTIVE,
    peripheralType: text(item.subcategory, 'keyboard') as any,
    title: text(item.title, 'Producto sin titulo'),
    slug: text(item.slug, ''),
    image: text(item.image, DEFAULT_IMAGE),
    images: normalizeStringArray(item.images),
    price: toNumber(item.price),
    discountedPrice: optionalNumber(item.discounted_price),
    currency: 'MXN',
    description: text(item.description, ''),
    fullDescription: text(item.description, ''),
    stock: toNumber(item.stock),
    lowStockThreshold: toNumber(item.low_stock_alert, 2),
    featured: Boolean(item.featured),
    published: Boolean(item.published),
    createdAt: new Date(),
    updatedAt: new Date(),
    specifications: {
      brand: text(specs['brand'], ''),
      model: text(specs['model'] ?? item.title, ''),
      ...specs,
    },
    features: normalizeStringArray(specs['features']),
    bestFor: normalizeStringArray(specs['bestFor']),
  } as CatalogProduct;
}

function buildCatalogSpecSummary(product: CatalogProduct): Record<string, unknown> {
  if (product.category === ProductCategory.ASSEMBLED) {
    return {
      processor: product.specifications.processor.title,
      motherboard: product.specifications.motherboard.title,
      ram: product.specifications.ram.title,
      storage: product.specifications.storage.map((item) => item.title).join(' + '),
      graphicsCard: product.specifications.graphicsCard.title,
      powerSupply: product.specifications.powerSupply.title,
      caseModel: product.specifications.case.title,
      cooling: product.specifications.cooling.title,
      powerCertificate: product.certifications.certificate,
      watts: product.certifications.wattage,
    };
  }

  return {
    ...product.specifications,
    componentType: 'componentType' in product ? product.componentType : undefined,
    peripheralType: 'peripheralType' in product ? product.peripheralType : undefined,
    features: 'features' in product ? product.features : undefined,
    bestFor: 'bestFor' in product ? product.bestFor : undefined,
  };
}

function normalizeProductCategory(value: unknown): ProductCategory {
  switch (value) {
    case ProductCategory.COMPONENT:
      return ProductCategory.COMPONENT;
    case ProductCategory.PERIPHERAL:
      return ProductCategory.PERIPHERAL;
    case ProductCategory.ACCESSORY:
      return ProductCategory.ACCESSORY;
    case ProductCategory.ASSEMBLED:
    default:
      return ProductCategory.ASSEMBLED;
  }
}

function defaultProductType(category?: AdminProduct['category'] | string): string {
  switch (category) {
    case 'paquetes':
    case ProductCategory.ASSEMBLED:
      return 'gabinete';
    case 'perifericos':
    case ProductCategory.PERIPHERAL:
      return 'periferico';
    case 'componentes':
    case ProductCategory.COMPONENT:
    default:
      return 'componente';
  }
}

function normalizeCoverImage(value: unknown): { url: string; alt?: string } | undefined {
  if (typeof value === 'string') {
    return value ? { url: value } : undefined;
  }

  const record = toRecord(value);
  const url = text(record['url'], '');
  if (!url) {
    return undefined;
  }

  return {
    url,
    alt: text(record['alt'], '') || undefined,
  };
}

function normalizeBrandLogos(product: CatalogProduct): unknown[] {
  const value = 'brandLogos' in product ? product.brandLogos : [];
  return normalizeArray(value);
}

function mapBrandLogosToAdmin(value: unknown): Array<{ src: string; alt: string }> {
  return normalizeArray(value)
    .map((item) => {
      const logo = toRecord(item);
      return {
        src: text(logo['src'] ?? logo['logo'], ''),
        alt: text(logo['alt'] ?? logo['name'], ''),
      };
    })
    .filter((logo) => logo.src || logo.alt);
}

function mapBrandLogosToCatalog(value: unknown): Array<{ name: string; logo: string }> {
  return normalizeArray(value)
    .map((item) => {
      const logo = toRecord(item);
      return {
        name: text(logo['name'] ?? logo['alt'], ''),
        logo: text(logo['logo'] ?? logo['src'], ''),
      };
    })
    .filter((logo) => logo.name || logo.logo);
}

function componentRef(id: string, value: unknown): { _id: string; title: string; specs: string } {
  const record = toRecord(value);
  if (Object.keys(record).length) {
    return {
      _id: text(record['_id'] ?? id, id),
      title: text(record['title'] ?? record['name'], ''),
      specs: text(record['specs'] ?? record['description'], ''),
    };
  }

  return {
    _id: id,
    title: text(value, ''),
    specs: '',
  };
}

function guessBrandFromCatalog(catalog: Record<string, unknown>): string {
  return text(
    readNested(catalog, ['performance', 'cpuBrand']) ??
      readNested(catalog, ['specifications', 'brand']),
    ''
  );
}

function guessGpuBrand(value: string): 'NVIDIA' | 'AMD' | 'INTEL' {
  const normalized = value.toLowerCase();
  if (normalized.includes('amd') || normalized.includes('radeon')) {
    return 'AMD';
  }
  if (normalized.includes('intel') || normalized.includes('arc')) {
    return 'INTEL';
  }
  return 'NVIDIA';
}

function guessCpuBrand(value: string): 'Intel' | 'AMD' {
  return value.toLowerCase().includes('intel') ? 'Intel' : 'AMD';
}

function extractWattage(value: string): number | undefined {
  const match = value.match(/(\d{3,4})\s*w/i);
  return match ? Number(match[1]) : undefined;
}

function readNested(record: Record<string, unknown>, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, record);
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => text(item, ''))
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function idToString(value: unknown): string | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  return String(value);
}

function text(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  return cleanDisplayText(String(value));
}

function cleanDisplayText(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/Ã¡/g, '\u00e1')
    .replace(/Ã©/g, '\u00e9')
    .replace(/Ã­/g, '\u00ed')
    .replace(/Ã³/g, '\u00f3')
    .replace(/Ãº/g, '\u00fa')
    .replace(/Ã±/g, '\u00f1')
    .replace(/Ã/g, '\u00c1')
    .replace(/Ã‰/g, '\u00c9')
    .replace(/Ã/g, '\u00cd')
    .replace(/Ã“/g, '\u00d3')
    .replace(/Ãš/g, '\u00da')
    .replace(/Ã‘/g, '\u00d1')
    .replace(/Â¿/g, '\u00bf')
    .replace(/Â¡/g, '\u00a1')
    .replace(/Â·/g, '\u00b7')
    .replace(/Â°/g, '\u00b0')
    .replace(/â€œ|â€/g, '"')
    .replace(/â€˜|â€™/g, "'")
    .replace(/â€“|â€”/g, '-')
    .replace(/â€¦/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function toNumber(value: unknown, fallback = 0): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function optionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function positiveOptionalNumber(value: unknown): number | null {
  const numberValue = optionalNumber(value);
  return numberValue && numberValue > 0 ? numberValue : null;
}

function toDate(value: unknown): Date {
  const date = value ? new Date(String(value)) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function serializeDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
