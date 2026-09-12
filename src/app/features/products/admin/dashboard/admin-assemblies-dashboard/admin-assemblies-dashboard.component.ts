import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import {
  CatalogDashboardView,
  CatalogStatusFilter,
  getCatalogDashboardItems,
} from '../../shared/admin-catalog-flow.utils';
import {
  buildCatalogQuickEditPatch,
  CatalogQuickEditDraft,
  beginCatalogQuickEditSave,
  confirmCatalogQuickEditSave,
  failCatalogQuickEditSave,
  reconcileCatalogQuickEditDrafts,
  isCatalogQuickEditDirty,
  resetCatalogQuickEditDraft,
} from '../../shared/admin-catalog-quick-edit.utils';
import {
  CatalogDashboardStats,
  Product,
  ProductsAdminService,
} from '../../shared/products-admin.service';

@Component({
  selector: 'app-admin-assemblies-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-assemblies-dashboard.component.html',
})
export class AdminAssembliesDashboardComponent implements OnInit, OnDestroy {
  readonly adminHomeUrl = adminUrl();
  stats: CatalogDashboardStats | null = null;
  assemblies: Product[] = [];
  filteredAssemblies: Product[] = [];
  visibleAssemblies: Product[] = [];
  selectedView: CatalogDashboardView = 'recent';
  currentPage = 0;
  readonly pageSize = 20;
  totalPages = 1;
  errorMessage = '';
  quickEditDrafts = new Map<string, CatalogQuickEditDraft>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly productsAdminService: ProductsAdminService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadAssemblies();
  }

  private loadStats(): void {
    this.productsAdminService
      .getCatalogDashboardStats('assemblies')
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      });
  }

  private loadAssemblies(): void {
    this.productsAdminService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.assemblies = response.data || [];
        this.initializeQuickEditDrafts(this.assemblies);
        this.filterAssemblies();
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
    this.setView(status);
  }

  setView(view: CatalogDashboardView): void {
    this.selectedView = view;
    this.currentPage = 0;
    this.filterAssemblies();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  editAssembly(id: string): void {
    this.router.navigate([adminUrl('assemblies'), id, 'edit']);
  }

  getQuickEditDraft(assemblyId: string): CatalogQuickEditDraft {
    const draft = this.quickEditDrafts.get(assemblyId);
    if (!draft) {
      throw new Error(`No existe un borrador de edición rápida para ${assemblyId}.`);
    }
    return draft;
  }

  isQuickEditDirty(assemblyId: string): boolean {
    return isCatalogQuickEditDirty(this.getQuickEditDraft(assemblyId));
  }

  markQuickEditChanged(assemblyId: string): void {
    const draft = this.getQuickEditDraft(assemblyId);
    draft.message = '';
    draft.messageType = '';
    draft.errors = {};
  }

  saveQuickEdit(assemblyId: string): void {
    const draft = this.getQuickEditDraft(assemblyId);
    if (!beginCatalogQuickEditSave(draft)) return;
    this.productsAdminService
      .updateProduct(assemblyId, buildCatalogQuickEditPatch(draft))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedAssembly) => {
          if (!savedAssembly) {
            this.setQuickEditSaveError(draft);
            return;
          }

          this.assemblies = this.assemblies.map((assembly) =>
            assembly._id === assemblyId ? savedAssembly : assembly
          );
          const confirmedDraft = confirmCatalogQuickEditSave(savedAssembly);
          this.quickEditDrafts.set(assemblyId, confirmedDraft);
          this.filterAssemblies(true);
          this.loadStats();
        },
        error: () => this.setQuickEditSaveError(draft),
      });
  }

  discardQuickEdit(assemblyId: string): void {
    const draft = this.getQuickEditDraft(assemblyId);
    if (!draft.saving) {
      resetCatalogQuickEditDraft(draft);
    }
  }

  handleQuickEditKeydown(event: KeyboardEvent, assemblyId: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveQuickEdit(assemblyId);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.discardQuickEdit(assemblyId);
    }
  }

  duplicateAssembly(assemblyId: string): void {
    this.productsAdminService
      .duplicateProduct(assemblyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadAssemblies();
        this.loadStats();
      });
  }

  deleteAssembly(assemblyId: string): void {
    if (!confirm('¿Eliminar este ensamble?')) {
      return;
    }

    this.productsAdminService
      .deleteProduct(assemblyId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((deleted) => {
        if (!deleted) {
          this.errorMessage = 'No se pudo eliminar el ensamble. Intenta de nuevo.';
          return;
        }

        this.errorMessage = '';
        this.loadAssemblies();
        this.loadStats();
      });
  }

  getStockLabel(assembly: Product): string {
    if (assembly.stock <= 0) return 'Sin stock';
    if (assembly.stock <= assembly.lowStockAlert) return `${assembly.stock} bajo stock`;
    return `${assembly.stock} en stock`;
  }

  private filterAssemblies(preservePage = false): void {
    if (!preservePage) {
      this.currentPage = 0;
    }
    this.filteredAssemblies = getCatalogDashboardItems(
      this.assemblies,
      'assemblies',
      this.selectedView,
      this.pageSize
    );
    this.totalPages = Math.max(1, Math.ceil(this.filteredAssemblies.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
    this.updatePagination();
  }

  private updatePagination(): void {
    const start = this.currentPage * this.pageSize;
    this.visibleAssemblies = this.filteredAssemblies.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  private initializeQuickEditDrafts(assemblies: Product[]): void {
    this.quickEditDrafts = reconcileCatalogQuickEditDrafts(assemblies, this.quickEditDrafts);
  }

  private setQuickEditSaveError(draft: CatalogQuickEditDraft): void {
    failCatalogQuickEditSave(draft);
    this.cdr.detectChanges();
  }

}
