import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { CatalogStatusFilter } from '../../shared/admin-catalog-flow.utils';
import { AdminAssemblyCardComponent } from '../../assemblies/shared/admin-assembly-card/admin-assembly-card.component';
import {
  CatalogDashboardStats,
  Product,
  ProductsAdminService,
} from '../../shared/products-admin.service';

@Component({
  selector: 'app-admin-assemblies-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminAssemblyCardComponent],
  templateUrl: './admin-assemblies-dashboard.component.html',
})
export class AdminAssembliesDashboardComponent implements OnInit, OnDestroy {
  readonly adminHomeUrl = adminUrl();
  stats: CatalogDashboardStats | null = null;
  recentAssemblies: Product[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.productsAdminService
      .getCatalogDashboardStats('assemblies')
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      });

    this.productsAdminService
      .getRecentCatalogItems('assemblies', 5)
      .pipe(takeUntil(this.destroy$))
      .subscribe((assemblies) => {
        this.recentAssemblies = assemblies;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToSection(section: 'new-assembly' | 'assemblies' | 'offers' | 'categories'): void {
    const routes: Record<typeof section, string> = {
      'new-assembly': adminUrl('assemblies/new'),
      assemblies: adminUrl('assemblies/list'),
      offers: adminUrl('assemblies/offers'),
      categories: adminUrl('assemblies/categories'),
    };

    this.router.navigate([routes[section]]);
  }

  goToStatus(status: CatalogStatusFilter): void {
    this.router.navigate(
      [adminUrl('assemblies/list')],
      { queryParams: { status } }
    );
  }

  editAssembly(id: string): void {
    this.router.navigate([adminUrl('assemblies'), id, 'edit']);
  }

}
