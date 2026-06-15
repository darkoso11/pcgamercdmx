import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductsAdminService, AdminDashboardStats, Product } from '../../shared/products-admin.service';
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
      'new-product': '/admin/products/new',
      'products': '/admin/products/list',
      'assemblies': '/admin/products/assemblies/new',
      'assemblies-list': '/admin/products/assemblies',
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

  getCategoryLabel(category: Product['category']): string {
    switch (category) {
      case 'paquetes':
        return 'Ensambles';
      case 'perifericos':
        return 'Perifericos';
      case 'componentes':
      default:
        return 'Hardware y accesorios';
    }
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
