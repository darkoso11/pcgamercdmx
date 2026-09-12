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
  createCatalogQuickEditDraft,
  isCatalogQuickEditDirty,
  resetCatalogQuickEditDraft,
  validateCatalogQuickEditDraft,
} from '../../shared/admin-catalog-quick-edit.utils';
import {
  Category,
  CatalogDashboardStats,
  Product,
  ProductsAdminService,
} from '../../shared/products-admin.service';
import { getAdminProductCategoryLabel } from '../../shared/admin-product-display.utils';

@Component({
  selector: 'app-admin-products-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-products-dashboard.component.html',
})
export class AdminProductsDashboardComponent implements OnInit, OnDestroy {
  readonly adminHomeUrl = adminUrl();
  stats: CatalogDashboardStats | null = null;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  visibleProducts: Product[] = [];
  categories: Category[] = [];
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
    this.setView(status);
  }

  setView(view: CatalogDashboardView): void {
    this.selectedView = view;
    this.currentPage = 0;
    this.filterProducts();
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

  editProduct(productId: string): void {
    this.router.navigate([adminUrl('products'), productId, 'edit']);
  }

  getQuickEditDraft(productId: string): CatalogQuickEditDraft {
    const draft = this.quickEditDrafts.get(productId);
    if (!draft) {
      throw new Error(`No existe un borrador de edición rápida para ${productId}.`);
    }
    return draft;
  }

  isQuickEditDirty(productId: string): boolean {
    return isCatalogQuickEditDirty(this.getQuickEditDraft(productId));
  }

  markQuickEditChanged(productId: string): void {
    const draft = this.getQuickEditDraft(productId);
    draft.message = '';
    draft.messageType = '';
    draft.errors = {};
  }

  saveQuickEdit(productId: string): void {
    const draft = this.getQuickEditDraft(productId);
    if (draft.saving || !isCatalogQuickEditDirty(draft)) {
      return;
    }

    draft.errors = validateCatalogQuickEditDraft(draft);
    draft.message = '';
    draft.messageType = '';
    if (Object.keys(draft.errors).length > 0) {
      return;
    }

    draft.saving = true;
    this.productsAdminService
      .updateProduct(productId, buildCatalogQuickEditPatch(draft))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (savedProduct) => {
          if (!savedProduct) {
            this.setQuickEditSaveError(draft);
            return;
          }

          this.products = this.products.map((product) =>
            product._id === productId ? savedProduct : product
          );
          const confirmedDraft = createCatalogQuickEditDraft(savedProduct);
          confirmedDraft.message = 'Cambios guardados.';
          confirmedDraft.messageType = 'success';
          this.quickEditDrafts.set(productId, confirmedDraft);
          this.filterProducts(true);
          this.loadStats();
        },
        error: () => this.setQuickEditSaveError(draft),
      });
  }

  discardQuickEdit(productId: string): void {
    const draft = this.getQuickEditDraft(productId);
    if (!draft.saving) {
      resetCatalogQuickEditDraft(draft);
    }
  }

  handleQuickEditKeydown(event: KeyboardEvent, productId: string): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveQuickEdit(productId);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.discardQuickEdit(productId);
    }
  }

  duplicateProduct(productId: string): void {
    this.productsAdminService
      .duplicateProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadProducts();
        this.loadStats();
      });
  }

  deleteProduct(productId: string): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    this.productsAdminService
      .deleteProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((deleted) => {
        if (!deleted) {
          this.errorMessage = 'No se pudo eliminar el producto. Intenta de nuevo.';
          return;
        }

        this.errorMessage = '';
        this.loadProducts();
        this.loadStats();
      });
  }

  getCategoryLabel(product: Product): string {
    return getAdminProductCategoryLabel(product, this.categories);
  }

  private loadDashboardData(): void {
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

    this.loadStats();
    this.loadProducts();
  }

  private loadStats(): void {
    this.productsAdminService
      .getCatalogDashboardStats('products')
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => {
        this.stats = stats;
        this.cdr.detectChanges();
      });
  }

  private loadProducts(): void {
    this.productsAdminService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.products = response.data || [];
        this.initializeQuickEditDrafts(this.products);
        this.filterProducts();
        this.cdr.detectChanges();
      });
  }

  private filterProducts(preservePage = false): void {
    if (!preservePage) {
      this.currentPage = 0;
    }
    this.filteredProducts = getCatalogDashboardItems(
      this.products,
      'products',
      this.selectedView,
      this.pageSize
    );
    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
    this.updatePagination();
  }

  private updatePagination(): void {
    const start = this.currentPage * this.pageSize;
    this.visibleProducts = this.filteredProducts.slice(start, start + this.pageSize);
    this.cdr.detectChanges();
  }

  private initializeQuickEditDrafts(products: Product[]): void {
    this.quickEditDrafts = new Map(
      products
        .filter((product): product is Product & { _id: string } => Boolean(product._id))
        .map((product) => [product._id, createCatalogQuickEditDraft(product)])
    );
  }

  private setQuickEditSaveError(draft: CatalogQuickEditDraft): void {
    draft.saving = false;
    draft.message = 'No se pudieron guardar los cambios. Intenta de nuevo.';
    draft.messageType = 'error';
    this.cdr.detectChanges();
  }
}
