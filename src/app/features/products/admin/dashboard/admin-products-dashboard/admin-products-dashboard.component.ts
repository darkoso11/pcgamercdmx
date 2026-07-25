import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductsAdminService, AdminDashboardStats, Category, Product } from '../../shared/products-admin.service';
import { getAdminProductCategoryLabel } from '../../shared/admin-product-display.utils';
import { Subject, takeUntil } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';

@Component({
  selector: 'app-admin-products-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-products-dashboard.component.html',
  styleUrls: []
})
export class AdminProductsDashboardComponent implements OnInit, OnDestroy {
  readonly adminHomeUrl = adminUrl();
  stats: AdminDashboardStats | null = null;
  recentProducts: any[] = [];
  categories: Category[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private productsAdminService: ProductsAdminService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar datos del dashboard
   */
  private loadDashboardData() {
    this.productsAdminService
      .getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.cdr.detectChanges();
        },
        error: () => {
          this.categories = [];
        },
      });

    // Obtener estadísticas
    this.productsAdminService
      .getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
        this.cdr.detectChanges();
      });

    // Obtener productos recientes
    this.productsAdminService
      .getRecentProducts(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.recentProducts = products;
        this.cdr.detectChanges();
      });
  }

  /**
   * Navegar a una sección del admin
   */
  goToSection(section: string) {
    const routes: { [key: string]: string } = {
      'new-product': adminUrl('products/new'),
      'products': adminUrl('products/list'),
      'assemblies': adminUrl('products/assemblies/new'),
      'assemblies-list': adminUrl('products/assemblies'),
      'offers': adminUrl('products/offers'),
      'categories': adminUrl('products/categories')
    };

    if (routes[section]) {
      this.router.navigate([routes[section]]);
    }
  }

  /**
   * Editar un producto
   */
  editProduct(product: Product) {
    const editorUrl = product.category === 'paquetes'
      ? adminUrl('products/assemblies')
      : adminUrl('products');
    this.router.navigate([editorUrl, product._id, 'edit']);
  }

  getCategoryLabel(product: Product): string {
    return getAdminProductCategoryLabel(product, this.categories);
  }

  getStockLabel(product: Product): string {
    if (product.stock <= 0) {
      return 'Sin stock';
    }

    if (product.stock <= product.lowStockAlert) {
      return `${product.stock} bajo stock`;
    }

    return `${product.stock} en stock`;
  }
}
