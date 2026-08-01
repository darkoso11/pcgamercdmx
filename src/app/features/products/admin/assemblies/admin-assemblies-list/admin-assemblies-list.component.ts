import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import { Product, ProductsAdminService } from '../../shared/products-admin.service';
import { AdminAssemblyCardComponent } from '../shared/admin-assembly-card/admin-assembly-card.component';
import {
  CatalogStatusFilter,
  filterAndSortCatalogItems,
} from '../../shared/admin-catalog-flow.utils';

@Component({
  selector: 'app-admin-assemblies-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent, AdminAssemblyCardComponent],
  templateUrl: './admin-assemblies-list.component.html',
})
export class AdminAssembliesListComponent implements OnInit, OnDestroy {
  assemblies: Product[] = [];
  filteredAssemblies: Product[] = [];
  selectedStatus: CatalogStatusFilter = 'all';
  loading = true;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly route: ActivatedRoute
  ) {
    this.selectedStatus = asCatalogStatusFilter(this.route.snapshot.queryParamMap.get('status'));
  }

  ngOnInit(): void {
    this.loadAssemblies();
  }

  loadAssemblies(): void {
    this.loading = true;
    this.errorMessage = '';
    this.productsAdminService
      .getProductsByCategory('paquetes')
      .pipe(takeUntil(this.destroy$))
      .subscribe((assemblies) => {
        this.assemblies = filterAndSortCatalogItems(assemblies, 'assemblies', 'all');
        this.filterAssemblies();
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  filterAssemblies(): void {
    this.filteredAssemblies = filterAndSortCatalogItems(
      this.assemblies,
      'assemblies',
      this.selectedStatus
    );
  }

  createAssembly(): void {
    this.router.navigate([adminUrl('assemblies/new')]);
  }

  editAssembly(id: string): void {
    this.router.navigate([adminUrl('assemblies'), id, 'edit']);
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
      .subscribe((deleted) => {
        if (!deleted) {
          this.errorMessage = 'No se pudo eliminar el ensamble. Intenta de nuevo.';
          return;
        }

        this.loadAssemblies();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

function asCatalogStatusFilter(value: string | null): CatalogStatusFilter {
  const validStatuses: CatalogStatusFilter[] = [
    'all',
    'published',
    'draft',
    'low-stock',
    'out-of-stock',
  ];

  return validStatuses.includes(value as CatalogStatusFilter)
    ? value as CatalogStatusFilter
    : 'all';
}
