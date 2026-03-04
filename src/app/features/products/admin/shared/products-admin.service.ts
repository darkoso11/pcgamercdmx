import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

// Modelos de Datos
export interface Product {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  category: 'paquetes' | 'perifericos' | 'componentes';
  price: number;
  discountedPrice?: number;
  processor?: string;
  motherboard?: string;
  ram?: string;
  storage?: string;
  graphicsCard?: string;
  powerSupply?: string;
  caseModel?: string;
  cooling?: string;
  image: string;
  images: string[];
  powerCertificate?: string;
  watts?: number;
  brandLogos: Array<{ src: string; alt: string }>;
  stock: number;
  lowStockAlert: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  published: boolean;
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
  publishedProducts: number;
  draftProducts: number;
  productsWithLowStock: number;
  totalPackages: number;
  totalOffers: number;
  activeOffers: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsAdminService {
  private apiUrl = '/api/admin/products';

  // Mock data para desarrollo
  private mockProducts: Product[] = [
    {
      _id: '1',
      title: 'PC Armada Gaming 2K',
      slug: 'pc-armada-gaming-2k',
      description: 'PC armada especializada para gaming en 2K',
      category: 'paquetes',
      price: 2500,
      processor: 'Intel i7-13700K',
      motherboard: 'ASUS B760',
      ram: '32GB DDR4',
      storage: '1TB SSD NVMe',
      graphicsCard: 'RTX 4070',
      powerSupply: '850W 80+ Gold',
      caseModel: 'NZXT H7 Flow RGB',
      cooling: 'Arctic Liquid 280mm',
      image: 'https://via.placeholder.com/500?text=Gaming+2K',
      images: [],
      powerCertificate: 'https://via.placeholder.com/100?text=80+Gold',
      watts: 850,
      brandLogos: [],
      stock: 5,
      lowStockAlert: 3,
      published: true,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-02-10')
    }
  ];

  private mockPackages: Package[] = [];
  private mockOffers: Offer[] = [];
  private mockCategories: Category[] = [
    {
      _id: '1',
      name: 'Gabinetes',
      slug: 'gabinetes',
      description: 'Casos y gabinetes para PC',
      icon: 'fa-box',
      order: 1,
      subcategories: [
        { _id: '1-1', name: 'Gaming', slug: 'gabinetes-gaming', icon: 'fa-gamepad', productCount: 0 },
        { _id: '1-2', name: 'Workstation', slug: 'gabinetes-workstation', icon: 'fa-cpu', productCount: 0 },
        { _id: '1-3', name: 'Compactos', slug: 'gabinetes-compactos', icon: 'fa-box-alt', productCount: 0 }
      ],
      productCount: 0
    },
    {
      _id: '2',
      name: 'Periféricos',
      slug: 'perifericos',
      description: 'Accesorios y periféricos para PC',
      icon: 'fa-mouse',
      order: 2,
      subcategories: [
        { _id: '2-1', name: 'Teclados', slug: 'perifericos-teclados', icon: 'fa-keyboard', productCount: 0 },
        { _id: '2-2', name: 'Ratones', slug: 'perifericos-ratones', icon: 'fa-mouse', productCount: 0 },
        { _id: '2-3', name: 'Audífonos', slug: 'perifericos-audifonos', icon: 'fa-headphones', productCount: 0 },
        { _id: '2-4', name: 'Monitores', slug: 'perifericos-monitores', icon: 'fa-tv', productCount: 0 }
      ],
      productCount: 0
    },
    {
      _id: '3',
      name: 'Componentes',
      slug: 'componentes',
      description: 'Componentes internos para PC',
      icon: 'fa-microchip',
      order: 3,
      subcategories: [
        { _id: '3-1', name: 'Procesadores', slug: 'componentes-procesadores', icon: 'fa-cpu', productCount: 0 },
        { _id: '3-2', name: 'Tarjetas Gráficas', slug: 'componentes-graficas', icon: 'fa-video', productCount: 0 },
        { _id: '3-3', name: 'Memoria RAM', slug: 'componentes-ram', icon: 'fa-microchip', productCount: 0 },
        { _id: '3-4', name: 'Almacenamiento', slug: 'componentes-almacenamiento', icon: 'fa-hdd', productCount: 0 },
        { _id: '3-5', name: 'Fuentes de Poder', slug: 'componentes-psu', icon: 'fa-plug', productCount: 0 }
      ],
      productCount: 0
    },
    {
      _id: '4',
      name: 'Ensambles',
      slug: 'ensambles',
      description: 'PCs armadas personalizadas',
      icon: 'fa-cube',
      order: 4,
      subcategories: [
        { _id: '4-1', name: 'Gaming 1080p', slug: 'ensambles-gaming-1080p', icon: 'fa-gamepad', productCount: 0 },
        { _id: '4-2', name: 'Gaming 2K', slug: 'ensambles-gaming-2k', icon: 'fa-gamepad', productCount: 0 },
        { _id: '4-3', name: 'Gaming 4K', slug: 'ensambles-gaming-4k', icon: 'fa-gamepad', productCount: 0 },
        { _id: '4-4', name: 'Workstation', slug: 'ensambles-workstation', icon: 'fa-cpu', productCount: 0 },
        { _id: '4-5', name: 'Streaming', slug: 'ensambles-streaming', icon: 'fa-stream', productCount: 0 }
      ],
      productCount: 0
    }
  ];

  constructor(private http: HttpClient) {}

  // ============ PRODUCTOS ============

  /**
   * Obtener todos los productos con filtros opcionales
   */
  getAllProducts(filters?: any, page?: number, limit?: number): Observable<{ data: Product[]; total: number }> {
    // En desarrollo, retornar mock data
    // En producción, hacer llamada HTTP
    const start = (page || 0) * (limit || 10);
    const end = start + (limit || 10);
    const paginated = this.mockProducts.slice(start, end);
    
    return of({ data: paginated, total: this.mockProducts.length }).pipe(delay(300));
  }

  /**
   * Obtener un producto por ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    return of(this.mockProducts.find(p => p._id === id)).pipe(delay(200));
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Observable<Product> {
    const newProduct: Product = {
      ...product,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockProducts.push(newProduct);
    return of(newProduct).pipe(delay(300));
  }

  /**
   * Actualizar un producto existente
   */
  updateProduct(id: string, product: Partial<Product>): Observable<Product | undefined> {
    const index = this.mockProducts.findIndex(p => p._id === id);
    if (index !== -1) {
      const updated = { ...this.mockProducts[index], ...product, updatedAt: new Date() };
      this.mockProducts[index] = updated;
      return of(updated).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(id: string): Observable<boolean> {
    const index = this.mockProducts.findIndex(p => p._id === id);
    if (index !== -1) {
      this.mockProducts.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  /**
   * Duplicar un producto existente
   */
  duplicateProduct(id: string): Observable<Product | undefined> {
    const original = this.mockProducts.find(p => p._id === id);
    if (original) {
      const duplicated: Product = {
        ...original,
        _id: Date.now().toString(),
        title: `${original.title} (Copia)`,
        slug: `${original.slug}-copia-${Date.now()}`,
        published: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.mockProducts.push(duplicated);
      return of(duplicated).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Buscar productos por término
   */
  searchProducts(term: string, category?: string): Observable<Product[]> {
    const results = this.mockProducts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(term.toLowerCase()) ||
                           p.slug.toLowerCase().includes(term.toLowerCase()) ||
                           p.processor?.toLowerCase().includes(term.toLowerCase());
      const matchesCategory = !category || p.category === category;
      return matchesSearch && matchesCategory;
    });
    return of(results).pipe(delay(300));
  }

  /**
   * Obtener productos por categoría
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.category === category)).pipe(delay(300));
  }

  // ============ PAQUETES ============

  /**
   * Obtener todos los paquetes
   */
  getAllPackages(): Observable<Package[]> {
    return of(this.mockPackages).pipe(delay(300));
  }

  /**
   * Obtener un paquete por ID
   */
  getPackageById(id: string): Observable<Package | undefined> {
    return of(this.mockPackages.find(p => p._id === id)).pipe(delay(200));
  }

  /**
   * Crear un nuevo paquete
   */
  createPackage(pkg: Omit<Package, '_id' | 'createdAt' | 'updatedAt'>): Observable<Package> {
    const newPackage: Package = {
      ...pkg,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockPackages.push(newPackage);
    return of(newPackage).pipe(delay(300));
  }

  /**
   * Actualizar un paquete
   */
  updatePackage(id: string, pkg: Partial<Package>): Observable<Package | undefined> {
    const index = this.mockPackages.findIndex(p => p._id === id);
    if (index !== -1) {
      const updated = { ...this.mockPackages[index], ...pkg, updatedAt: new Date() };
      this.mockPackages[index] = updated;
      return of(updated).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Eliminar un paquete
   */
  deletePackage(id: string): Observable<boolean> {
    const index = this.mockPackages.findIndex(p => p._id === id);
    if (index !== -1) {
      this.mockPackages.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // ============ OFERTAS ============

  /**
   * Obtener todas las ofertas
   */
  getAllOffers(includeInactive?: boolean): Observable<Offer[]> {
    const offers = includeInactive ? this.mockOffers : this.mockOffers.filter(o => o.active);
    return of(offers).pipe(delay(300));
  }

  /**
   * Crear una nueva oferta
   */
  createOffer(offer: Omit<Offer, '_id' | 'createdAt' | 'updatedAt'>): Observable<Offer> {
    const newOffer: Offer = {
      ...offer,
      _id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mockOffers.push(newOffer);
    return of(newOffer).pipe(delay(300));
  }

  /**
   * Actualizar una oferta
   */
  updateOffer(id: string, offer: Partial<Offer>): Observable<Offer | undefined> {
    const index = this.mockOffers.findIndex(o => o._id === id);
    if (index !== -1) {
      const updated = { ...this.mockOffers[index], ...offer, updatedAt: new Date() };
      this.mockOffers[index] = updated;
      return of(updated).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Eliminar una oferta
   */
  deleteOffer(id: string): Observable<boolean> {
    const index = this.mockOffers.findIndex(o => o._id === id);
    if (index !== -1) {
      this.mockOffers.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  /**
   * Activar una oferta
   */
  activateOffer(id: string): Observable<void> {
    const offer = this.mockOffers.find(o => o._id === id);
    if (offer) {
      offer.active = true;
      return of(undefined).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Desactivar una oferta
   */
  deactivateOffer(id: string): Observable<void> {
    const offer = this.mockOffers.find(o => o._id === id);
    if (offer) {
      offer.active = false;
      return of(undefined).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Obtener ofertas activas
   */
  getActiveOffers(): Observable<Offer[]> {
    return of(this.mockOffers.filter(o => o.active)).pipe(delay(300));
  }

  // ============ CATEGORÍAS ============

  /**
   * Crear una nueva categoría
   */
  createCategory(category: Omit<Category, '_id'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      _id: Date.now().toString()
    };
    this.mockCategories.push(newCategory);
    return of(newCategory).pipe(delay(300));
  }

  /**
   * Actualizar una categoría
   */
  updateCategory(id: string, category: Partial<Category>): Observable<Category | undefined> {
    const index = this.mockCategories.findIndex(c => c._id === id);
    if (index !== -1) {
      const updated = { ...this.mockCategories[index], ...category };
      this.mockCategories[index] = updated;
      return of(updated).pipe(delay(300));
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Eliminar una categoría
   */
  deleteCategory(id: string): Observable<boolean> {
    const index = this.mockCategories.findIndex(c => c._id === id);
    if (index !== -1) {
      this.mockCategories.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  /**
   * Reordenar categorías
   */
  reorderCategories(newOrder: Category[]): Observable<void> {
    this.mockCategories = newOrder;
    return of(undefined).pipe(delay(300));
  }

  /**
   * Agregar subcategoría a una categoría
   */
  addSubcategory(categoryId: string, subcategory: Omit<Subcategory, '_id'>): Observable<Subcategory> {
    const category = this.mockCategories.find(c => c._id === categoryId);
    if (category) {
      const newSubcategory: Subcategory = {
        ...subcategory,
        _id: `${categoryId}-${Date.now()}`,
        productCount: 0
      };
      category.subcategories.push(newSubcategory);
      return of(newSubcategory).pipe(delay(300));
    }
    throw new Error('Categoría no encontrada');
  }

  /**
   * Actualizar una subcategoría
   */
  updateSubcategory(categoryId: string, subcategoryId: string, subcategory: Partial<Subcategory>): Observable<Subcategory | undefined> {
    const category = this.mockCategories.find(c => c._id === categoryId);
    if (category) {
      const index = category.subcategories.findIndex(s => s._id === subcategoryId);
      if (index !== -1) {
        const updated = { ...category.subcategories[index], ...subcategory };
        category.subcategories[index] = updated;
        return of(updated).pipe(delay(300));
      }
    }
    return of(undefined).pipe(delay(300));
  }

  /**
   * Eliminar una subcategoría
   */
  deleteSubcategory(categoryId: string, subcategoryId: string): Observable<boolean> {
    const category = this.mockCategories.find(c => c._id === categoryId);
    if (category) {
      const index = category.subcategories.findIndex(s => s._id === subcategoryId);
      if (index !== -1) {
        category.subcategories.splice(index, 1);
        return of(true).pipe(delay(300));
      }
    }
    return of(false).pipe(delay(300));
  }

  /**
   * Obtener todas las categorías con subcategorías
   */
  getAllCategories(): Observable<Category[]> {
    return of(this.mockCategories).pipe(delay(300));
  }

  /**
   * Obtener una categoría con sus subcategorías
   */
  getCategoryById(id: string): Observable<Category | undefined> {
    return of(this.mockCategories.find(c => c._id === id)).pipe(delay(300));
  }

  // ============ IMÁGENES ============

  /**
   * Subir imagen de producto
   */
  uploadProductImage(file: File): Observable<string> {
    // En desarrollo, retornar URL placeholder
    // En producción, hacer upload real
    return of(`https://via.placeholder.com/500?text=${file.name}`).pipe(delay(500));
  }

  /**
   * Eliminar imagen de producto
   */
  deleteProductImage(imageUrl: string): Observable<void> {
    return of(undefined).pipe(delay(300));
  }

  /**
   * Optimizar imagen
   */
  optimizeImage(file: File, width: number, height: number): Observable<Blob> {
    return of(file).pipe(delay(500));
  }

  // ============ ESTADÍSTICAS ============

  /**
   * Obtener estadísticas del dashboard
   */
  getDashboardStats(): Observable<AdminDashboardStats> {
    const stats: AdminDashboardStats = {
      totalProducts: this.mockProducts.length,
      publishedProducts: this.mockProducts.filter(p => p.published).length,
      draftProducts: this.mockProducts.filter(p => !p.published).length,
      productsWithLowStock: this.mockProducts.filter(p => p.stock <= p.lowStockAlert).length,
      totalPackages: this.mockPackages.length,
      totalOffers: this.mockOffers.length,
      activeOffers: this.mockOffers.filter(o => o.active).length
    };
    return of(stats).pipe(delay(300));
  }

  /**
   * Obtener productos recientes
   */
  getRecentProducts(limit: number = 10): Observable<Product[]> {
    return of(this.mockProducts.slice(0, limit)).pipe(delay(300));
  }

  /**
   * Obtener productos con bajo stock
   */
  getLowStockProducts(): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.stock <= p.lowStockAlert)).pipe(delay(300));
  }
}
