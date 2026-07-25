import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../../../admin/admin-header.component';
import { adminUrl } from '../../../../admin/admin-route.config';
import { ProductsAdminService, Product } from '../../shared/products-admin.service';
import {
  CatalogStatusFilter,
  filterAndSortCatalogItems,
} from '../../shared/admin-catalog-flow.utils';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-product-list.component.html'
})
export class AdminProductListComponent implements OnInit, OnDestroy {
  readonly adminNewProductUrl = adminUrl('products/new');
  products: (Product & { selected?: boolean })[] = [];
  filteredProducts: (Product & { selected?: boolean })[] = [];
  paginatedProducts: (Product & { selected?: boolean })[] = [];

  searchTerm = '';
  selectedCategory = '';
  selectedStatus: CatalogStatusFilter = 'all';
  selectAll = false;

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
    this.loadProducts();
  }

  loadProducts(): void {
    this.productsAdminService
      .getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        const productsData = Array.isArray(response) ? response : (response.data || []);
        this.products = filterAndSortCatalogItems(productsData, 'products', 'all')
          .map((product) => ({ ...product, selected: false }));
        this.filterProducts();
        this.cdr.detectChanges();
      });
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  filterProducts(): void {
    this.currentPage = 0;
    this.selectAll = false;

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
    ) as (Product & { selected?: boolean })[];

    this.totalPages = Math.max(1, Math.ceil(this.filteredProducts.length / this.pageSize));
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

  toggleSelectAll(): void {
    this.paginatedProducts.forEach((product) => {
      product.selected = this.selectAll;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedStatus = 'all';
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
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
