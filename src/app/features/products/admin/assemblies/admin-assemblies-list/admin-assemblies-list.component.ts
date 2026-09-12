import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import { Product, ProductsAdminService } from '../../shared/products-admin.service';
import {
  CatalogStatusFilter,
  filterAndSortCatalogItems,
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

@Component({
  selector: 'app-admin-assemblies-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-assemblies-list.component.html',
})
export class AdminAssembliesListComponent implements OnInit, OnDestroy {
  assemblies: Product[] = [];
  filteredAssemblies: Product[] = [];
  selectedStatus: CatalogStatusFilter = 'all';
  loading = true;
  errorMessage = '';
  quickEditDrafts = new Map<string, CatalogQuickEditDraft>();

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
        this.initializeQuickEditDrafts(this.assemblies);
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
          this.filterAssemblies();
          this.cdr.detectChanges();
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

  getStockLabel(assembly: Product): string {
    if (assembly.stock <= 0) return 'Sin stock';
    if (assembly.stock <= assembly.lowStockAlert) return `${assembly.stock} bajo stock`;
    return `${assembly.stock} en stock`;
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

  private initializeQuickEditDrafts(assemblies: Product[]): void {
    this.quickEditDrafts = reconcileCatalogQuickEditDrafts(assemblies, this.quickEditDrafts);
  }

  private setQuickEditSaveError(draft: CatalogQuickEditDraft): void {
    failCatalogQuickEditSave(draft);
    this.cdr.detectChanges();
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
