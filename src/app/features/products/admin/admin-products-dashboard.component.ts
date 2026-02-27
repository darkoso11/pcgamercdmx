import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductsAdminService, AdminDashboardStats, Product } from './products-admin.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-products-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-products-dashboard.component.html',
  styleUrls: []
})
export class AdminProductsDashboardComponent implements OnInit, OnDestroy {
  stats: AdminDashboardStats | null = null;
  recentProducts: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private productsAdminService: ProductsAdminService,
    private router: Router
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
    // Obtener estadísticas
    this.productsAdminService
      .getDashboardStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats = stats;
      });

    // Obtener productos recientes
    this.productsAdminService
      .getRecentProducts(5)
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.recentProducts = products;
      });
  }

  /**
   * Navegar a una sección del admin
   */
  goToSection(section: string) {
    const routes: { [key: string]: string } = {
      'new-product': '/admin/products/new',
      'products': '/admin/products/list',
      'assemblies': '/admin/products/assemblies/new',
      'packages': '/admin/products/packages',
      'offers': '/admin/products/offers',
      'categories': '/admin/products/categories'
    };

    if (routes[section]) {
      this.router.navigate([routes[section]]);
    }
  }

  /**
   * Editar un producto
   */
  editProduct(productId: string) {
    this.router.navigate(['/admin/products', productId, 'edit']);
  }
}
