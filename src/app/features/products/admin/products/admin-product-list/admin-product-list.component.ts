import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import {
  BulkProductResult,
  Category,
  ProductsAdminService,
  Product,
} from '../../shared/products-admin.service';
import { getAdminProductCategoryLabel } from '../../shared/admin-product-display.utils';
import {
  CatalogStatusFilter,
  filterAndSortCatalogItems,
} from '../../shared/admin-catalog-flow.utils';

type BulkConfirmationAction = 'publish' | 'deactivate' | 'duplicate' | 'delete';
type BulkEditMode = 'category' | 'price' | 'stock' | 'low-stock';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-product-list.component.html'
})
export class AdminProductListComponent implements OnInit, OnDestroy {
  readonly adminNewProductUrl = adminUrl('products/new');
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  categories: Category[] = [];
  selectedProductIds = new Set<string>();
  bulkActionInProgress = false;
  bulkMessage = '';
  bulkMessageType: 'success' | 'error' | 'info' = 'info';
  pendingBulkAction: BulkConfirmationAction | null = null;
  bulkEditMode: BulkEditMode | null = null;
  bulkEditMenuOpen = false;
  bulkCategory: Product['category'] | '' = '';
  bulkSubcategoryId = '';
  bulkPriceMode: 'set' | 'percentage' = 'set';
  bulkPriceValue: number | null = null;
  bulkStockMode: 'set' | 'increase' | 'decrease' = 'set';
  bulkStockValue: number | null = null;
  bulkLowStockAlert: number | null = null;

  searchTerm = '';
  selectedCategory = '';
  selectedStatus: CatalogStatusFilter = 'all';

  currentPage = 0;
  pageSize = 10;
  totalPages = 1;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private productsAdminService: ProductsAdminService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {
    this.selectedStatus = asCatalogStatusFilter(this.route.snapshot.queryParamMap.get('status'));

    // Debounce búsqueda
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.filterProducts();
      });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories(): void {
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
  }

  loadProducts(preservePage = false): void {
    this.productsAdminService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        const productsData = Array.isArray(response) ? response : (response.data || []);
        this.products = filterAndSortCatalogItems(productsData, 'products', 'all');
        this.filterProducts(!preservePage);
        this.cdr.detectChanges();
      });
  }

  onSearchChange(): void {
    this.clearSelection();
    this.searchSubject$.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.clearSelection();
    this.filterProducts();
  }

  filterProducts(resetPage = true): void {
    if (resetPage) {
      this.currentPage = 0;
    }

    const textAndCategoryMatches = this.products.filter((product) => {
      const matchesSearch =
        this.searchTerm === '' ||
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory =
        this.selectedCategory === '' || product.category === this.selectedCategory;

      return matchesSearch && matchesCategory;
    });

    this.filteredProducts = filterAndSortCatalogItems(
      textAndCategoryMatches,
      'products',
      this.selectedStatus
    ) as Product[];

    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
    this.currentPage = Math.min(this.currentPage, this.totalPages - 1);
    this.updatePagination();
    this.cdr.detectChanges();
  }

  updatePagination(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.filteredProducts.slice(start, end);
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

  get selectedCount(): number {
    return this.selectedProductIds.size;
  }

  get pageSelectionState(): 'none' | 'some' | 'all' {
    const pageIds = this.paginatedProducts
      .map((product) => product._id)
      .filter((id): id is string => Boolean(id));
    const selectedOnPage = pageIds.filter((id) => this.selectedProductIds.has(id)).length;

    if (selectedOnPage === 0) {
      return 'none';
    }

    return selectedOnPage === pageIds.length ? 'all' : 'some';
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProductIds.has(productId);
  }

  toggleProductSelection(productId: string, selected: boolean): void {
    if (selected) {
      this.selectedProductIds.add(productId);
    } else {
      this.selectedProductIds.delete(productId);
    }
  }

  toggleCurrentPage(selected: boolean): void {
    this.paginatedProducts.forEach((product) => {
      if (product._id) {
        this.toggleProductSelection(product._id, selected);
      }
    });
  }

  selectAllFilteredResults(): void {
    this.filteredProducts.forEach((product) => {
      if (product._id) {
        this.selectedProductIds.add(product._id);
      }
    });
  }

  clearSelection(): void {
    this.selectedProductIds.clear();
    this.pendingBulkAction = null;
    this.bulkEditMode = null;
    this.bulkEditMenuOpen = false;
  }

  get bulkSubcategories() {
    return this.categories.find((category) => category.slug === this.bulkCategory)?.subcategories ?? [];
  }

  get pendingBulkActionLabel(): string {
    const labels: Record<BulkConfirmationAction, string> = {
      publish: 'publicar',
      deactivate: 'desactivar y pasar a borrador',
      duplicate: 'duplicar como borrador',
      delete: 'eliminar permanentemente',
    };
    return this.pendingBulkAction ? labels[this.pendingBulkAction] : '';
  }

  openBulkConfirmation(action: BulkConfirmationAction): void {
    if (this.selectedCount === 0 || this.bulkActionInProgress) {
      return;
    }
    this.bulkEditMode = null;
    this.bulkEditMenuOpen = false;
    this.pendingBulkAction = action;
  }

  cancelBulkAction(): void {
    if (!this.bulkActionInProgress) {
      this.pendingBulkAction = null;
    }
  }

  confirmBulkAction(): void {
    if (!this.pendingBulkAction || this.bulkActionInProgress || this.selectedCount === 0) {
      return;
    }

    const ids = Array.from(this.selectedProductIds);
    switch (this.pendingBulkAction) {
      case 'publish':
        this.executeBulkAction(
          this.productsAdminService.bulkUpdateProducts(ids, { published: true }),
          'producto publicado',
          'productos publicados'
        );
        break;
      case 'deactivate':
        this.executeBulkAction(
          this.productsAdminService.bulkUpdateProducts(ids, { published: false }),
          'producto desactivado',
          'productos desactivados'
        );
        break;
      case 'duplicate':
        this.executeBulkAction(
          this.productsAdminService.bulkDuplicateProducts(ids),
          'producto duplicado como borrador',
          'productos duplicados como borrador'
        );
        break;
      case 'delete':
        this.executeBulkAction(
          this.productsAdminService.bulkDeleteProducts(ids),
          'producto eliminado',
          'productos eliminados'
        );
        break;
    }
  }

  openBulkEdit(mode: BulkEditMode): void {
    if (this.selectedCount === 0 || this.bulkActionInProgress) {
      return;
    }
    this.pendingBulkAction = null;
    this.bulkEditMode = mode;
    this.bulkEditMenuOpen = false;
    this.bulkMessage = '';
  }

  cancelBulkEdit(): void {
    if (!this.bulkActionInProgress) {
      this.bulkEditMode = null;
    }
  }

  applyBulkEdit(): void {
    switch (this.bulkEditMode) {
      case 'category':
        this.applyBulkCategory();
        break;
      case 'price':
        this.applyBulkPrice();
        break;
      case 'stock':
        this.applyBulkStock();
        break;
      case 'low-stock':
        this.applyBulkLowStockAlert();
        break;
    }
  }

  applyBulkPrice(): void {
    if (!this.hasValidBulkNumber(this.bulkPriceValue, this.bulkPriceMode === 'set')) {
      this.setBulkError('Ingresa un precio válido. El precio fijo no puede ser negativo.');
      return;
    }

    const value = this.bulkPriceValue!;
    this.executeBulkUpdate(
      (id) => {
        const currentPrice = this.findSelectedProduct(id)?.price ?? 0;
        const nextPrice = this.bulkPriceMode === 'set'
          ? value
          : currentPrice * (1 + value / 100);
        return { price: Math.max(0, Math.round(nextPrice * 100) / 100) };
      },
      'precio de producto actualizado',
      'precios de productos actualizados'
    );
  }

  applyBulkStock(): void {
    if (!this.hasValidBulkNumber(this.bulkStockValue, true) || !Number.isInteger(this.bulkStockValue)) {
      this.setBulkError('Ingresa una cantidad de stock entera y no negativa.');
      return;
    }

    const value = Math.trunc(this.bulkStockValue!);
    this.executeBulkUpdate(
      (id) => {
        const currentStock = this.findSelectedProduct(id)?.stock ?? 0;
        const nextStock = this.bulkStockMode === 'set'
          ? value
          : this.bulkStockMode === 'increase'
            ? currentStock + value
            : currentStock - value;
        return { stock: Math.max(0, nextStock) };
      },
      'stock de producto actualizado',
      'stocks de productos actualizados'
    );
  }

  applyBulkLowStockAlert(): void {
    if (!this.hasValidBulkNumber(this.bulkLowStockAlert, true) || !Number.isInteger(this.bulkLowStockAlert)) {
      this.setBulkError('Ingresa una alerta de bajo stock entera y no negativa.');
      return;
    }

    this.executeBulkUpdate(
      { lowStockAlert: Math.trunc(this.bulkLowStockAlert!) },
      'alerta de producto actualizada',
      'alertas de productos actualizadas'
    );
  }

  applyBulkCategory(): void {
    const category = this.categories.find((item) => item.slug === this.bulkCategory);
    const subcategory = category?.subcategories.find((item) => item._id === this.bulkSubcategoryId);
    if (!category || !subcategory || !category._id || !subcategory._id) {
      this.setBulkError('Selecciona una categoría y una subcategoría válida.');
      return;
    }

    this.executeBulkUpdate(
      {
        category: this.bulkCategory as Product['category'],
        categoryId: category._id,
        subcategoryId: subcategory._id,
      },
      'categoría de producto actualizada',
      'categorías de productos actualizadas'
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = 'all';
    this.clearSelection();
    this.filterProducts();
  }

  editProduct(productId: string): void {
    this.router.navigate([adminUrl('products'), productId, 'edit']);
  }

  duplicateProduct(productId: string): void {
    this.productsAdminService
      .duplicateProduct(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((newProduct: any) => {
        this.loadProducts();
        if (newProduct && newProduct.title) {
          alert(`Producto duplicado: ${newProduct.title}`);
        }
      });
  }

  deleteProduct(productId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productsAdminService
        .deleteProduct(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe((deleted) => {
          if (!deleted) {
            alert('No se pudo eliminar el producto. Intenta de nuevo.');
            return;
          }

          this.loadProducts();
          alert('Producto eliminado correctamente');
        });
    }
  }

  private executeBulkUpdate(
    changes: Partial<Product> | ((id: string) => Partial<Product>),
    singularSuccess: string,
    pluralSuccess: string
  ): void {
    const ids = Array.from(this.selectedProductIds);
    if (ids.length === 0 || this.bulkActionInProgress) {
      return;
    }
    this.executeBulkAction(
      this.productsAdminService.bulkUpdateProducts(ids, changes),
      singularSuccess,
      pluralSuccess
    );
  }

  private executeBulkAction(
    operation$: Observable<BulkProductResult>,
    singularSuccess: string,
    pluralSuccess: string
  ): void {
    this.bulkActionInProgress = true;
    this.bulkMessage = 'Procesando productos seleccionados…';
    this.bulkMessageType = 'info';

    operation$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          result.successfulIds.forEach((id) => this.selectedProductIds.delete(id));
          this.bulkActionInProgress = false;
          this.pendingBulkAction = null;
          this.bulkEditMode = null;

          if (result.failedIds.length > 0) {
            const correctLabel = result.successfulIds.length === 1 ? 'correcto' : 'correctos';
            this.bulkMessage = `${result.successfulIds.length} ${correctLabel} y ${result.failedIds.length} con error. Los productos con error siguen seleccionados.`;
            this.bulkMessageType = 'error';
          } else {
            const label = result.successfulIds.length === 1 ? singularSuccess : pluralSuccess;
            this.bulkMessage = `${result.successfulIds.length} ${label}.`;
            this.bulkMessageType = 'success';
          }

          this.loadProducts(true);
        },
        error: () => {
          this.bulkActionInProgress = false;
          this.pendingBulkAction = null;
          this.setBulkError('No se pudo completar la acción masiva. La selección se conservó.');
        },
      });
  }

  private findSelectedProduct(id: string): Product | undefined {
    return this.products.find((product) => product._id === id);
  }

  private hasValidBulkNumber(value: number | null, requireNonNegative: boolean): boolean {
    return value !== null && Number.isFinite(value) && (!requireNonNegative || value >= 0);
  }

  private setBulkError(message: string): void {
    this.bulkMessage = message;
    this.bulkMessageType = 'error';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
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
