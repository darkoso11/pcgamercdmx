import { CommonModule } from '@angular/common';
import { afterEveryRender, ChangeDetectorRef, Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
import { ProductCategory, ProductStatus } from '../../shared/models';
import { COMMERCIAL_PAGES } from '../commercial-pages/commercial-pages.config';
import { CatalogCategory, catalogCategoryPath, matchesCatalogCategory } from './catalog-categories';
import { CatalogProduct, ProductCardViewModel, ProductsService } from './services/products.service';
import { catalogProductBrand, catalogProductType, normalizeCatalogText } from './catalog-filters';
import { CATALOG_TYPES } from './catalog-types';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent {
  private readonly service = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  @ViewChild('filterToggle') filterToggle?: ElementRef<HTMLButtonElement>;
  @ViewChild('categoryChips') categoryChips?: ElementRef<HTMLElement>;
  private lastVisibleChip: Element | null = null;

  readonly commercialPages = [...COMMERCIAL_PAGES,
    { key: 'alta', path: 'pc-gamer-gama-alta', label: 'PC Gamer gama alta' }];
  readonly categoryPath = catalogCategoryPath;
  categories: CatalogCategory[] = [];
  private taxonomy: CatalogCategory[] = [];
  readonly types = CATALOG_TYPES;
  items: Array<{ product: CatalogProduct; card: ProductCardViewModel }> = [];
  filteredItems: typeof this.items = [];
  brands: string[] = [];
  // Route context must be available on the first hydration pass, before HTTP emits.
  group = this.route.snapshot.data['catalogGroup'] ?? '';
  category: CatalogCategory | undefined = this.route.snapshot.data['catalogCategory'];
  searchTerm = '';
  brand = '';
  type = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStock = false;
  page = 1;
  filtersOpen = false;

  constructor() {
    afterEveryRender(() => {
      const row = this.categoryChips?.nativeElement;
      const active = row?.querySelector<HTMLElement>('[aria-current="page"]');
      if (row && active && active !== this.lastVisibleChip) {
        if (row.scrollWidth > row.clientWidth) {
          row.scrollLeft += active.getBoundingClientRect().left - row.getBoundingClientRect().left - (row.clientWidth - active.clientWidth) / 2;
        }
        this.lastVisibleChip = active;
      }
    });
    combineLatest([
      this.route.parent!.data,
      this.route.data,
      this.route.queryParamMap,
    ]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ([parentData, data, params]) => {
        // The parent resolver supplies identical data before SSR and hydration render.
        const products = (parentData['catalogProducts'] as CatalogProduct[]).filter(product =>
          product.category !== ProductCategory.ASSEMBLED && product.status !== ProductStatus.DISCONTINUED
        );
        this.items = products.map(product => ({ product, card: this.service.toProductCardViewModel(product) }));
        this.group = data['catalogGroup'] ?? '';
        this.category = data['catalogCategory'];
        this.taxonomy = parentData['catalogCategories'] as CatalogCategory[];
        this.categories = this.taxonomy.filter(category => products.some(product => this.matchesCategory(product, category)) || category === this.category);
        const brands = new Map<string, string>();
        for (const product of products) {
          const brand = this.productBrand(product);
          if (brand && !brands.has(normalizeCatalogText(brand))) brands.set(normalizeCatalogText(brand), brand);
        }
        this.brands = [...brands.values()].sort((a, b) => a.localeCompare(b, 'es'));
        this.searchTerm = params.get('q') ?? '';
        const requestedBrand = params.get('brand') ?? '';
        this.brand = brands.get(normalizeCatalogText(requestedBrand)) ?? requestedBrand;
        this.type = params.get('type') ?? '';
        this.minPrice = this.priceParam(params.get('min'));
        this.maxPrice = this.priceParam(params.get('max'));
        this.inStock = params.get('stock') === '1';
        const requestedPage = Number(params.get('page'));
        this.page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
        this.filterItems();
        this.cdr.markForCheck();
      },
    });
  }

  get heading(): string { return this.category?.label ?? (this.group === 'perifericos' ? 'Periféricos' : this.group ? 'Hardware y accesorios' : 'Todos los productos'); }
  get visibleItems(): typeof this.items { return this.filteredItems.slice(0, this.page * 24); }
  get hiddenCount(): number { return Math.max(0, this.filteredItems.length - this.page * 24); }
  get hasFilters(): boolean { return !!(this.searchTerm || this.brand || this.type || this.minPrice !== null || this.maxPrice !== null || this.inStock); }
  get secondaryFilterCount(): number { return Number(this.minPrice !== null) + Number(this.maxPrice !== null) + Number(this.inStock); }
  get unknownType(): boolean { return !!this.type && !this.types.some(type => type.slug === this.type); }

  updateQuery(params: Params): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { ...params, page: null }, queryParamsHandling: 'merge' });
  }

  clearFilters(): void {
    this.updateQuery({ q: null, brand: null, type: null, min: null, max: null, stock: null });
  }

  showMore(): void {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { page: this.page + 1 }, queryParamsHandling: 'merge' });
  }

  closeFilters(): void {
    this.filtersOpen = false;
    this.filterToggle?.nativeElement.focus();
  }

  private priceParam(value: string | null): number | null {
    return value !== null && value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  }

  private productBrand(product: CatalogProduct): string {
    return catalogProductBrand(product);
  }

  private matchesCategory(product: CatalogProduct, category: CatalogCategory): boolean {
    return matchesCatalogCategory(product, category);
  }

  private filterItems(): void {
    const words = normalizeCatalogText(this.searchTerm).split(' ').filter(Boolean);
    this.filteredItems = this.items.filter(({ product, card }) => {
      if (this.group === 'perifericos' && product.category !== ProductCategory.PERIPHERAL) return false;
      if (this.group === 'hardware-accesorios' && product.category === ProductCategory.PERIPHERAL) return false;
      if (this.category && !this.matchesCategory(product, this.category)) return false;
      if (this.brand && normalizeCatalogText(this.productBrand(product)) !== normalizeCatalogText(this.brand)) return false;
      const type = catalogProductType(product, this.taxonomy);
      if (this.type && type !== this.type) return false;
      if (this.inStock && !card.inStock) return false;
      const price = card.discountedPrice ?? card.price;
      if (this.minPrice !== null && price < this.minPrice) return false;
      if (this.maxPrice !== null && price > this.maxPrice) return false;
      const label = this.categories.find(category => this.matchesCategory(product, category))?.label ?? '';
      const searchable = normalizeCatalogText([product.title, product.description, this.productBrand(product), label,
        this.types.find(option => option.slug === type)?.label ?? '',
        ...card.specHighlights.map(spec => `${spec.label} ${spec.value}`)].join(' '));
      return words.every(word => searchable.includes(word));
    });
  }
}
