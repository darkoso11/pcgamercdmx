import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { CatalogStatusFilter } from '../../shared/admin-catalog-flow.utils';
import {
  CatalogDashboardStats,
  Product,
  ProductsAdminService,
} from '../../shared/products-admin.service';

@Component({
  selector: 'app-admin-products-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-products-dashboard.component.html',
})
export class AdminProductsDashboardComponent implements OnInit, OnDestroy {
  readonly adminHomeUrl = adminUrl();
  stats: CatalogDashboardStats | null = null;
  recentProducts: Product[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToSection(section: 'new-product' | 'products' | 'offers' | 'categories'): void {
    const routes: Record<typeof section, string> = {
      'new-product': adminUrl('products/new'),
      products: adminUrl('products/list'),
      offers: adminUrl('products/offers'),
      categories: adminUrl('products/categories'),
    };

    this.router.navigate([routes[section]]);
  }

  goToStatus(status: CatalogStatusFilter): void {
    this.router.navigate(
      [adminUrl('products/list')],
      { queryParams: { status } }
    );
  }

  editProduct(productId: string): void {
    this.router.navigate([adminUrl('products'), productId, 'edit']);
  }

  getCategoryLabel(category: Product['category']): string {
    return category === 'perifericos' ? 'Perifericos' : 'Hardware y accesorios';
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

  private loadDashboardData(): void {
    this.productsAdminService
      .getCatalogDashboardStats('products')
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      });

    this.productsAdminService
      .getRecentCatalogItems('products', 5)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.recentProducts = products;
        this.cdr.detectChanges();
      });
  }
}
