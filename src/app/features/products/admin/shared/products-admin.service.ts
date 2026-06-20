import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DirectusApiService } from '../../../../core/services/directus-api.service';
import {
  DirectusCategoryRecord,
  DirectusProductRecord,
  DirectusSubcategoryRecord,
  mapAdminCategoryToDirectusPayload,
  mapAdminProductToDirectusPayload,
  mapAdminSubcategoryToDirectusPayload,
  mapDirectusCategoryToAdminCategory,
  mapDirectusProductToAdminProduct,
  mapDirectusSubcategoryToAdminSubcategory,
  slugify,
} from '../../../../core/services/directus-content.mapper';
import { ProductCategory } from '../../../../shared/models';

export interface Product {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  category: 'paquetes' | 'perifericos' | 'componentes';
  productType?: string;
  brand?: string;
  categoryId?: string;
  subcategoryId?: string;
  price: number;
  discountedPrice?: number;
  discountPrice?: number;
  discountPercent?: number;
  currency?: string;
  sku?: string;
  supplier?: string;
  pricingMode?: 'manual' | 'provider';
  syncEnabled?: boolean;
  syncProvider?: string;
  providerProductId?: string;
  providerSku?: string;
  lastPriceSyncedAt?: string;
  lastSyncStatus?: string;
  lastSyncError?: string;
  processor?: string;
  motherboard?: string;
  ram?: string;
  storage?: string;
  nvmeSsd?: string;
  graphicsCard?: string;
  powerSupply?: string;
  caseModel?: string;
  case?: string;
  cooling?: string;
  image: string;
  images: string[];
  gallery?: string[];
  powerCertificate?: string;
  watts?: number;
  brandLogos: Array<{ src: string; alt: string }>;
  stock: number;
  lowStockAlert: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  published: boolean;
  featured?: boolean;
  modelo?: string;
  tipo?: string;
  conexion?: string;
  tamaño?: string;
  material?: string;
  puertos?: string;
  especificacionPersonalizada?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  discountedPrice?: number;
  specifications: {
    processor: string;
    motherboard: string;
    ram: string;
    storage: string;
    graphicsCard: string;
    powerSupply: string;
    caseModel: string;
    cooling: string;
  };
  includedProducts: string[];
  stock: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Offer {
  _id?: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bundle' | 'category';
  discountValue: number;
  applicableTo: {
    products?: string[];
    packages?: string[];
    categories?: string[];
  };
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subcategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  productCount?: number;
}

export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  subcategories: Subcategory[];
  productCount?: number;
}

export interface AdminDashboardStats {
  totalProducts: number;
  totalAssemblies: number;
  publishedProducts: number;
  draftProducts: number;
  productsWithLowStock: number;
  productsOutOfStock: number;
  totalOffers: number;
  activeOffers: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsAdminService {
  private readonly productsCollection = 'pc_products';
  private readonly categoriesCollection = 'pc_categories';
  private readonly subcategoriesCollection = 'pc_subcategories';

  private mockPackages: Package[] = [];
  private mockOffers: Offer[] = [];
  private mockProducts: Product[] = [];
  private mockCategories: Category[] = [
    {
      _id: '1',
      name: 'Ensambles',
      slug: 'ensambles',
      description: 'PCs armadas personalizadas',
      icon: 'fa-cube',
      order: 1,
      subcategories: [
        { _id: '1-1', name: 'Gaming 1080p', slug: 'ensambles-gaming-1080p', icon: 'fa-gamepad', productCount: 0 },
        { _id: '1-2', name: 'Gaming 2K', slug: 'ensambles-gaming-2k', icon: 'fa-gamepad', productCount: 0 },
        { _id: '1-3', name: 'Workstation', slug: 'ensambles-workstation', icon: 'fa-cpu', productCount: 0 },
      ],
      productCount: 0,
    },
    {
      _id: '2',
      name: 'Hardware y accesorios',
      slug: 'componentes',
      description: 'Partes, cables, adaptadores y accesorios para PC',
      icon: 'fa-microchip',
      order: 2,
      subcategories: [
        { _id: '2-1', name: 'Procesadores', slug: 'componentes-procesadores', icon: 'fa-cpu', productCount: 0 },
        { _id: '2-2', name: 'Tarjetas Graficas', slug: 'componentes-graficas', icon: 'fa-video', productCount: 0 },
        { _id: '2-3', name: 'Memoria RAM', slug: 'componentes-ram', icon: 'fa-microchip', productCount: 0 },
      ],
      productCount: 0,
    },
    {
      _id: '3',
      name: 'Perifericos',
      slug: 'perifericos',
      description: 'Accesorios y perifericos para PC',
      icon: 'fa-mouse',
      order: 3,
      subcategories: [
        { _id: '3-1', name: 'Teclados', slug: 'perifericos-teclados', icon: 'fa-keyboard', productCount: 0 },
        { _id: '3-2', name: 'Ratones', slug: 'perifericos-ratones', icon: 'fa-mouse', productCount: 0 },
        { _id: '3-3', name: 'Monitores', slug: 'perifericos-monitores', icon: 'fa-tv', productCount: 0 },
      ],
      productCount: 0,
    },
  ];

  constructor(private readonly directus: DirectusApiService) {}

  getAllProducts(filters?: any, page?: number, limit?: number): Observable<{ data: Product[]; total: number }> {
    if (!this.usesDirectus()) {
      const filtered = this.applyProductFilters(this.mockProducts, filters);
      return of(this.paginateProducts(filtered, page, limit));
    }

    return this.loadDirectusProductsWithFallback().pipe(
      map((products) => this.paginateProducts(this.applyProductFilters(products, filters), page, limit))
    );
  }

  getProductById(id: string): Observable<Product | undefined> {
    if (!this.usesDirectus()) {
      return of(this.mockProducts.find((product) => product._id === id));
    }

    return this.loadDirectusProductById(id, true).pipe(
      catchError(() => this.loadDirectusProductById(id, false)),
      catchError(() => of(undefined))
    );
  }

  createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'> | Product): Observable<Product> {
    if (!this.usesDirectus()) {
      const newProduct = {
        ...product,
        _id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Product;
      this.mockProducts.push(newProduct);
      return of(newProduct);
    }

    return this.directus
      .createItem<DirectusProductRecord>(
        this.productsCollection,
        mapAdminProductToDirectusPayload(product) as unknown as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusProductToAdminProduct(response.data)));
  }

  updateProduct(id: string, product: Partial<Product>): Observable<Product | undefined> {
    if (!this.usesDirectus()) {
      const index = this.mockProducts.findIndex((item) => item._id === id);
      if (index === -1) {
        return of(undefined);
      }
      this.mockProducts[index] = { ...this.mockProducts[index], ...product, updatedAt: new Date() };
      return of(this.mockProducts[index]);
    }

    return this.directus
      .updateItem<DirectusProductRecord>(
        this.productsCollection,
        id,
        mapAdminProductToDirectusPayload(product) as unknown as Record<string, unknown>,
        { auth: true }
      )
      .pipe(
        map((response) => mapDirectusProductToAdminProduct(response.data)),
        catchError(() => of(undefined))
      );
  }

  deleteProduct(id: string): Observable<boolean> {
    if (!this.usesDirectus()) {
      const index = this.mockProducts.findIndex((product) => product._id === id);
      if (index === -1) {
        return of(false);
      }
      this.mockProducts.splice(index, 1);
      return of(true);
    }

    return this.directus
      .deleteItem(this.productsCollection, id, { auth: true })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  duplicateProduct(id: string): Observable<Product | undefined> {
    return this.getProductById(id).pipe(
      switchMap((product) => {
        if (!product) {
          return of(undefined);
        }

        const duplicated: Product = {
          ...product,
          title: `${product.title} (Copia)`,
          slug: `${product.slug}-copia-${Date.now()}`,
          published: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        delete duplicated._id;

        return this.createProduct(duplicated);
      })
    );
  }

  searchProducts(term: string, category?: string): Observable<Product[]> {
    const normalized = term.trim().toLowerCase();
    return this.getAllProducts().pipe(
      map((response) =>
        response.data.filter((product) => {
          const text = `${product.title} ${product.slug} ${product.description} ${product.processor ?? ''}`.toLowerCase();
          return (!normalized || text.includes(normalized)) && (!category || product.category === category);
        })
      )
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map((response) => response.data.filter((product) => product.category === category))
    );
  }

  getAllPackages(): Observable<Package[]> {
    return of(this.mockPackages);
  }

  getPackageById(id: string): Observable<Package | undefined> {
    return of(this.mockPackages.find((pkg) => pkg._id === id));
  }

  createPackage(pkg: Omit<Package, '_id' | 'createdAt' | 'updatedAt'>): Observable<Package> {
    const newPackage: Package = { ...pkg, _id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    this.mockPackages.push(newPackage);
    return of(newPackage);
  }

  updatePackage(id: string, pkg: Partial<Package>): Observable<Package | undefined> {
    const index = this.mockPackages.findIndex((item) => item._id === id);
    if (index === -1) {
      return of(undefined);
    }
    this.mockPackages[index] = { ...this.mockPackages[index], ...pkg, updatedAt: new Date() };
    return of(this.mockPackages[index]);
  }

  deletePackage(id: string): Observable<boolean> {
    const index = this.mockPackages.findIndex((item) => item._id === id);
    if (index === -1) {
      return of(false);
    }
    this.mockPackages.splice(index, 1);
    return of(true);
  }

  getAllOffers(includeInactive?: boolean): Observable<Offer[]> {
    return of(includeInactive ? this.mockOffers : this.mockOffers.filter((offer) => offer.active));
  }

  createOffer(offer: Omit<Offer, '_id' | 'createdAt' | 'updatedAt'>): Observable<Offer> {
    const newOffer: Offer = { ...offer, _id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    this.mockOffers.push(newOffer);
    return of(newOffer);
  }

  updateOffer(id: string, offer: Partial<Offer>): Observable<Offer | undefined> {
    const index = this.mockOffers.findIndex((item) => item._id === id);
    if (index === -1) {
      return of(undefined);
    }
    this.mockOffers[index] = { ...this.mockOffers[index], ...offer, updatedAt: new Date() };
    return of(this.mockOffers[index]);
  }

  deleteOffer(id: string): Observable<boolean> {
    const index = this.mockOffers.findIndex((offer) => offer._id === id);
    if (index === -1) {
      return of(false);
    }
    this.mockOffers.splice(index, 1);
    return of(true);
  }

  activateOffer(id: string): Observable<void> {
    const offer = this.mockOffers.find((item) => item._id === id);
    if (offer) {
      offer.active = true;
    }
    return of(undefined);
  }

  deactivateOffer(id: string): Observable<void> {
    const offer = this.mockOffers.find((item) => item._id === id);
    if (offer) {
      offer.active = false;
    }
    return of(undefined);
  }

  getActiveOffers(): Observable<Offer[]> {
    return of(this.mockOffers.filter((offer) => offer.active));
  }

  createCategory(category: Omit<Category, '_id'>): Observable<Category> {
    if (!this.usesDirectus()) {
      const newCategory: Category = { ...category, _id: Date.now().toString() };
      this.mockCategories.push(newCategory);
      return of(newCategory);
    }

    return this.directus
      .createItem<DirectusCategoryRecord>(
        this.categoriesCollection,
        mapAdminCategoryToDirectusPayload(category) as Record<string, unknown>,
        { auth: true }
      )
      .pipe(map((response) => mapDirectusCategoryToAdminCategory(response.data)));
  }

  updateCategory(id: string, category: Partial<Category>): Observable<Category | undefined> {
    if (!this.usesDirectus()) {
      const index = this.mockCategories.findIndex((item) => item._id === id);
      if (index === -1) {
        return of(undefined);
      }
      this.mockCategories[index] = { ...this.mockCategories[index], ...category };
      return of(this.mockCategories[index]);
    }

    return this.directus
      .updateItem<DirectusCategoryRecord>(
        this.categoriesCollection,
        id,
        this.buildCategoryPatch(category),
        { auth: true }
      )
      .pipe(
        map((response) => mapDirectusCategoryToAdminCategory(response.data)),
        catchError(() => of(undefined))
      );
  }

  deleteCategory(id: string): Observable<boolean> {
    if (!this.usesDirectus()) {
      const index = this.mockCategories.findIndex((item) => item._id === id);
      if (index === -1) {
        return of(false);
      }
      this.mockCategories.splice(index, 1);
      return of(true);
    }

    return this.directus
      .deleteItem(this.categoriesCollection, id, { auth: true })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  reorderCategories(newOrder: Category[]): Observable<void> {
    if (!this.usesDirectus()) {
      this.mockCategories = newOrder;
      return of(undefined);
    }

    return forkJoin(
      newOrder.map((category, index) =>
        this.directus.updateItem<DirectusCategoryRecord>(
          this.categoriesCollection,
          category._id!,
          { sort: index + 1 },
          { auth: true }
        )
      )
    ).pipe(map(() => undefined));
  }

  addSubcategory(categoryId: string, subcategory: Omit<Subcategory, '_id'>): Observable<Subcategory> {
    if (!this.usesDirectus()) {
      const category = this.mockCategories.find((item) => item._id === categoryId);
      if (!category) {
        throw new Error('Categoria no encontrada');
      }
      const newSubcategory = { ...subcategory, _id: `${categoryId}-${Date.now()}`, productCount: 0 };
      category.subcategories.push(newSubcategory);
      return of(newSubcategory);
    }

    return this.getCategoryById(categoryId).pipe(
      switchMap((category) =>
        this.directus.createItem<DirectusSubcategoryRecord>(
          this.subcategoriesCollection,
          mapAdminSubcategoryToDirectusPayload(categoryId, category?.slug ?? categoryId, subcategory) as Record<string, unknown>,
          { auth: true }
        )
      ),
      map((response) => mapDirectusSubcategoryToAdminSubcategory(response.data))
    );
  }

  updateSubcategory(categoryId: string, subcategoryId: string, subcategory: Partial<Subcategory>): Observable<Subcategory | undefined> {
    if (!this.usesDirectus()) {
      const category = this.mockCategories.find((item) => item._id === categoryId);
      const index = category?.subcategories.findIndex((item) => item._id === subcategoryId) ?? -1;
      if (!category || index === -1) {
        return of(undefined);
      }
      category.subcategories[index] = { ...category.subcategories[index], ...subcategory };
      return of(category.subcategories[index]);
    }

    return this.directus
      .updateItem<DirectusSubcategoryRecord>(
        this.subcategoriesCollection,
        subcategoryId,
        this.buildSubcategoryPatch(subcategory),
        { auth: true }
      )
      .pipe(
        map((response) => mapDirectusSubcategoryToAdminSubcategory(response.data)),
        catchError(() => of(undefined))
      );
  }

  deleteSubcategory(categoryId: string, subcategoryId: string): Observable<boolean> {
    if (!this.usesDirectus()) {
      const category = this.mockCategories.find((item) => item._id === categoryId);
      const index = category?.subcategories.findIndex((item) => item._id === subcategoryId) ?? -1;
      if (!category || index === -1) {
        return of(false);
      }
      category.subcategories.splice(index, 1);
      return of(true);
    }

    return this.directus
      .deleteItem(this.subcategoriesCollection, subcategoryId, { auth: true })
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  getAllCategories(): Observable<Category[]> {
    if (!this.usesDirectus()) {
      return of(this.mockCategories);
    }

    return this.loadDirectusCategories(true).pipe(
      catchError(() => this.loadDirectusCategories(false))
    );
  }

  private loadDirectusCategories(auth: boolean): Observable<Category[]> {
    const options = auth ? { auth: true } : {};

    return forkJoin({
      categories: this.directus.readItems<DirectusCategoryRecord>(
        this.categoriesCollection,
        { fields: '*', sort: 'sort,name', limit: 100 },
        options
      ),
      subcategories: this.directus.readItems<DirectusSubcategoryRecord>(
        this.subcategoriesCollection,
        { fields: '*', sort: 'sort,name', limit: 300 },
        options
      ).pipe(catchError(() => of({ data: [] }))),
      products: this.directus.readItems<DirectusProductRecord>(
        this.productsCollection,
        { fields: 'id,category,subcategory', limit: 1000 },
        options
      ),
    }).pipe(
      map(({ categories, subcategories, products }) => {
        return categories.data.map((category) => {
          const categoryId = String(category.id);
          const categorySubcategories = subcategories.data
            .filter((subcategory) => String(subcategory.category_id) === categoryId)
            .map(mapDirectusSubcategoryToAdminSubcategory);
          const productCount = products.data.filter(
            (product) => product.category === categorySlugToProductCategory(category.slug)
          ).length;

          return mapDirectusCategoryToAdminCategory(category, categorySubcategories, productCount);
        });
      })
    );
  }

  getCategoryById(id: string): Observable<Category | undefined> {
    return this.getAllCategories().pipe(
      map((categories) => categories.find((category) => category._id === id))
    );
  }

  uploadProductImage(file: File): Observable<string> {
    return of(`https://via.placeholder.com/500?text=${encodeURIComponent(file.name)}`);
  }

  deleteProductImage(imageUrl: string): Observable<void> {
    return of(undefined);
  }

  optimizeImage(file: File, width: number, height: number): Observable<Blob> {
    return of(file);
  }

  getDashboardStats(): Observable<AdminDashboardStats> {
    return forkJoin({
      products: this.getAllProducts(),
      offers: this.getAllOffers(true),
    }).pipe(
      map(({ products, offers }) => {
        const catalogProducts = products.data.filter((product) => product.category !== 'paquetes');
        const assemblies = products.data.filter((product) => product.category === 'paquetes');

        return {
          totalProducts: catalogProducts.length,
          totalAssemblies: assemblies.length,
          publishedProducts: catalogProducts.filter((product) => product.published).length,
          draftProducts: catalogProducts.filter((product) => !product.published).length,
          productsWithLowStock: catalogProducts.filter((product) => product.stock > 0 && product.stock <= product.lowStockAlert).length,
          productsOutOfStock: catalogProducts.filter((product) => product.stock <= 0).length,
          totalOffers: offers.length,
          activeOffers: offers.filter((offer) => offer.active).length,
        };
      })
    );
  }

  getRecentProducts(limit: number = 10): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map((response) => response.data.filter((product) => product.category !== 'paquetes').slice(0, limit))
    );
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map((response) =>
        response.data.filter((product) => product.category !== 'paquetes' && product.stock > 0 && product.stock <= product.lowStockAlert)
      )
    );
  }

  private usesDirectus(): boolean {
    return this.directus.isEnabled('catalog');
  }

  private loadDirectusProductsWithFallback(): Observable<Product[]> {
    return this.loadDirectusProducts(true).pipe(
      catchError(() => this.loadDirectusProducts(false))
    );
  }

  private loadDirectusProducts(auth: boolean): Observable<Product[]> {
    return this.directus
      .readItems<DirectusProductRecord>(
        this.productsCollection,
        { fields: '*', sort: 'sort,title', limit: 1000 },
        auth ? { auth: true } : {}
      )
      .pipe(map((response) => response.data.map(mapDirectusProductToAdminProduct)));
  }

  private loadDirectusProductById(id: string, auth: boolean): Observable<Product | undefined> {
    return this.directus
      .readItem<DirectusProductRecord>(
        this.productsCollection,
        id,
        { fields: '*' },
        auth ? { auth: true } : {}
      )
      .pipe(map((response) => mapDirectusProductToAdminProduct(response.data)));
  }

  private applyProductFilters(products: Product[], filters?: any): Product[] {
    let filtered = [...products];
    if (!filters) {
      return filtered;
    }

    if (filters.category) {
      filtered = filtered.filter((product) => product.category === filters.category);
    }

    if (filters.published !== undefined) {
      filtered = filtered.filter((product) => product.published === filters.published);
    }

    if (filters.search) {
      const search = String(filters.search).toLowerCase();
      filtered = filtered.filter((product) =>
        `${product.title} ${product.slug} ${product.description}`.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  private paginateProducts(products: Product[], page?: number, limit?: number): { data: Product[]; total: number } {
    if (page === undefined || limit === undefined) {
      return { data: products, total: products.length };
    }

    const start = page * limit;
    return {
      data: products.slice(start, start + limit),
      total: products.length,
    };
  }

  private buildCategoryPatch(category: Partial<Category>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (category.name !== undefined) payload['name'] = category.name;
    if (category.slug !== undefined) payload['slug'] = category.slug || slugify(category.name ?? 'categoria');
    if (category.description !== undefined) payload['description'] = category.description;
    if (category.icon !== undefined) payload['icon'] = category.icon;
    if (category.order !== undefined) payload['sort'] = category.order;
    return payload;
  }

  private buildSubcategoryPatch(subcategory: Partial<Subcategory>): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    if (subcategory.name !== undefined) payload['name'] = subcategory.name;
    if (subcategory.slug !== undefined) payload['slug'] = subcategory.slug || slugify(subcategory.name ?? 'subcategoria');
    if (subcategory.description !== undefined) payload['description'] = subcategory.description;
    if (subcategory.icon !== undefined) payload['icon'] = subcategory.icon;
    return payload;
  }
}

function categorySlugToProductCategory(slug?: string): ProductCategory {
  switch (slug) {
    case 'ensambles':
      return ProductCategory.ASSEMBLED;
    case 'perifericos':
      return ProductCategory.PERIPHERAL;
    case 'componentes':
    default:
      return ProductCategory.COMPONENT;
  }
}
