import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import { Product, ProductsAdminService } from '../../shared/products-admin.service';

@Component({
  selector: 'app-admin-assemblies-list',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-assemblies-list.component.html',
})
export class AdminAssembliesListComponent implements OnInit, OnDestroy {
  assemblies: Product[] = [];
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAssemblies();
  }

  loadAssemblies(): void {
    this.loading = true;
    this.productsAdminService
      .getProductsByCategory('paquetes')
      .pipe(takeUntil(this.destroy$))
      .subscribe((assemblies) => {
        this.assemblies = assemblies;
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  createAssembly(): void {
    this.router.navigate([adminUrl('products/assemblies/new')]);
  }

  editAssembly(id: string): void {
    this.router.navigate([adminUrl('products/assemblies'), id, 'edit']);
  }

  duplicateAssembly(id: string): void {
    this.productsAdminService
      .duplicateProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAssemblies());
  }

  deleteAssembly(id: string): void {
    if (!confirm('¿Eliminar este ensamble?')) {
      return;
    }

    this.productsAdminService
      .deleteProduct(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadAssemblies());
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(price);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
