import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AdminHeaderComponent } from '../../blog/admin/admin-header.component';
import { ProductsAdminService, Product } from './products-admin.service';

@Component({
  selector: 'app-admin-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminHeaderComponent],
  templateUrl: './admin-product-list.component.html'
})
export class AdminProductListComponent implements OnInit, OnDestroy {
  products: (Product & { selected?: boolean })[] = [];
  filteredProducts: (Product & { selected?: boolean })[] = [];
  paginatedProducts: (Product & { selected?: boolean })[] = [];

  searchTerm = '';
  selectedCategory = '';
  selectedStatus = '';
  selectAll = false;

  currentPage = 0;
  pageSize = 10;
  totalPages = 1;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private productsAdminService: ProductsAdminService,
    private router: Router
  ) {
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
        this.products = productsData.map((p: any) => ({ ...p, selected: false }));
        this.filterProducts();
      });
  }

  onSearchChange(): void {
    this.searchSubject$.next(this.searchTerm);
  }

  filterProducts(): void {
    this.currentPage = 0;
    this.selectAll = false;

    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch =
        this.searchTerm === '' ||
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.slug.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory =
        this.selectedCategory === '' || product.category === this.selectedCategory;

      const matchesStatus =
        this.selectedStatus === '' ||
        (this.selectedStatus === 'published' && product.published) ||
        (this.selectedStatus === 'draft' && !product.published);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.updatePagination();
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
    this.selectedStatus = '';
    this.filterProducts();
  }

  editProduct(productId: string): void {
    this.router.navigate(['/admin/products', productId, 'edit']);
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
        .subscribe(() => {
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
