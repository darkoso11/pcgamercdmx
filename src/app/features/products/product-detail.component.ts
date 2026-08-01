import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CatalogProduct,
  ProductCardViewModel,
  ProductsService,
} from './services/products.service';
import { ProductCategory } from '../../shared/models';
import { buildWhatsAppUrl } from '../../shared/config/business-info';
import { SeoService } from '../../core/services/seo.service';

interface DetailViewModel {
  rootLabel: string;
  rootLink: string;
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
  originalPrice?: number;
  priceLabel: string;
  categoryLabel: string;
  segmentLabel: string;
  segmentLink: string;
  badges: string[];
  specEntries: Array<{ label: string; value: string }>;
  featureEntries: string[];
  infoChips: string[];
  brandLogos: Array<{ src: string; alt: string }>;
  inventoryLabel: string;
  inStock: boolean;
  supportLabel: string;
  certificationImage?: string;
  certificationText?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: CatalogProduct | null = null;
  detail: DetailViewModel | null = null;
  relatedProducts: ProductCardViewModel[] = [];
  loading = true;
  notFound = false;
  notFoundRootLink = '/productos';
  notFoundRootLabel = 'Volver al catalogo';
  selectedImageIndex = 0;
  isGalleryOpen = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsService: ProductsService,
    private readonly seoService: SeoService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.loadProduct(params['slug']);
    });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.notFound = false;
    this.syncNotFoundFallback();

    this.productsService
      .getCatalogProductBySlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        if (!product) {
          this.product = null;
          this.detail = null;
          this.relatedProducts = [];
          this.notFound = true;
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.product = product;
        this.detail = this.buildDetailViewModel(product);
        this.selectedImageIndex = 0;
        this.isGalleryOpen = false;
        this.updateMetaTags(product);
        this.loadRelatedProducts(product.slug);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  loadRelatedProducts(slug: string): void {
    this.productsService
      .getRelatedCatalogProducts(slug, 4)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.relatedProducts = products.map((product) =>
          this.productsService.toProductCardViewModel(product)
        );
        this.cdr.detectChanges();
      });
  }

  goToProduct(slug: string): void {
    if (!this.product) {
      return;
    }

    this.router.navigate(this.productsService.getDetailLink(this.product.category, slug));
  }

  requestQuote(): void {
    this.router.navigate(['/contacto'], {
      queryParams: { product: this.product?.slug },
    });
  }

  openWhatsApp(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const message =
      `Hola, me interesa el producto ${this.product?.title}. Quiero una cotizacion personalizada.`
    window.open(buildWhatsAppUrl(message), '_blank');
  }

  get selectedImage(): string {
    return this.detail?.gallery[this.selectedImageIndex] ?? this.detail?.image ?? '';
  }

  selectImage(index: number): void {
    if (!this.detail?.gallery[index]) {
      return;
    }

    this.selectedImageIndex = index;
  }

  previousImage(): void {
    const imageCount = this.detail?.gallery.length ?? 0;
    if (imageCount < 2) {
      return;
    }

    this.selectedImageIndex = (this.selectedImageIndex - 1 + imageCount) % imageCount;
  }

  nextImage(): void {
    const imageCount = this.detail?.gallery.length ?? 0;
    if (imageCount < 2) {
      return;
    }

    this.selectedImageIndex = (this.selectedImageIndex + 1) % imageCount;
  }

  openGallery(): void {
    if (this.selectedImage) {
      this.isGalleryOpen = true;
    }
  }

  closeGallery(): void {
    this.isGalleryOpen = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleGalleryKeydown(event: KeyboardEvent): void {
    if (!this.isGalleryOpen) {
      return;
    }

    if (event.key === 'Escape') {
      this.closeGallery();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previousImage();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.nextImage();
    }
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    img.onerror = null;
  }

  trackByLabel(_: number, item: { label: string }): string {
    return item.label;
  }

  private buildDetailViewModel(product: CatalogProduct): DetailViewModel {
    const categoryLabel = this.productsService.getCategoryLabel(product.category);
    const segmentLink = this.productsService.getSegmentLink(product.category);
    const specEntries = this.buildSpecEntries(product);
    const featureEntries = this.buildFeatureEntries(product);
    const infoChips = this.buildInfoChips(product);

    const gallery = [product.image, ...(product.images ?? [])]
      .filter((image): image is string => Boolean(image))
      .filter((image, index, images) => images.indexOf(image) === index);

    return {
      rootLabel:
        product.category === ProductCategory.ASSEMBLED ? 'Ensambles' : 'Productos',
      rootLink:
        product.category === ProductCategory.ASSEMBLED ? '/ensambles' : '/productos',
      title: product.title,
      description: product.fullDescription ?? product.description,
      image: product.image,
      gallery,
      price: product.discountedPrice ?? product.price,
      originalPrice: product.discountedPrice ? product.price : undefined,
      priceLabel:
        product.category === ProductCategory.ASSEMBLED
          ? 'Precio referencial'
          : 'Precio de catalogo',
      categoryLabel,
      segmentLabel: categoryLabel,
      segmentLink,
      badges: this.productsService.toProductCardViewModel(product).badges,
      specEntries,
      featureEntries,
      infoChips,
      brandLogos: this.buildBrandLogos(product),
      inventoryLabel: this.buildInventoryLabel(product),
      inStock: product.stock > 0,
      supportLabel:
        product.category === ProductCategory.ASSEMBLED
          ? 'Cotizamos ajustes de RAM, almacenamiento y GPU sobre esta misma base.'
          : 'Te ayudamos a validar compatibilidad con tu build antes de comprar.',
      certificationImage: this.buildCertificationImage(product),
      certificationText: this.buildCertificationText(product),
    };
  }

  private buildSpecEntries(product: CatalogProduct): Array<{ label: string; value: string }> {
    const shared = this.productsService.toSpecHighlights(product, 8);

    if (product.category === ProductCategory.ASSEMBLED) {
      const specs = product.specifications;
      const storage = (specs.storage ?? [])
        .map((item) => item.title)
        .filter(Boolean)
        .join(' + ');
      const certification = [
        product.certifications.wattage > 0 ? `${product.certifications.wattage}W` : '',
        product.certifications.certificate,
      ].filter(Boolean).join(' ');

      return [
        { label: 'CPU', value: specs.processor?.title ?? '' },
        { label: 'Motherboard', value: specs.motherboard?.title ?? '' },
        { label: 'GPU', value: specs.graphicsCard?.title ?? '' },
        { label: 'RAM', value: specs.ram?.title ?? '' },
        { label: 'Almacenamiento', value: storage },
        { label: 'Fuente', value: specs.powerSupply?.title ?? '' },
        { label: 'Potencia y certificación', value: certification },
        { label: 'Enfriamiento', value: specs.cooling?.title ?? '' },
        { label: 'Gabinete', value: specs.case?.title ?? '' },
        { label: 'Sistema operativo', value: specs.operatingSystem ?? '' },
        { label: 'Ventiladores', value: specs.fans ?? '' },
      ].filter((entry) => entry.value.trim().length > 0);
    }

    return shared;
  }

  private buildFeatureEntries(product: CatalogProduct): string[] {
    if (product.category === ProductCategory.ASSEMBLED) {
      return product.highlights ?? [];
    }

    if (product.category === ProductCategory.COMPONENT) {
      return product.bestFor ?? [];
    }

    if (product.category === ProductCategory.PERIPHERAL) {
      return product.features;
    }

    return [];
  }

  private buildInfoChips(product: CatalogProduct): string[] {
    if (product.category === ProductCategory.ASSEMBLED) {
      return [
        product.performance.totalRam,
        product.performance.storageCapacity,
        product.certifications.wattage > 0 ? `${product.certifications.wattage}W` : '',
      ].filter(Boolean);
    }

    if (product.category === ProductCategory.COMPONENT) {
      return [
        product.componentType.toUpperCase(),
        ...(product.bestFor ?? []).slice(0, 2),
      ];
    }

    if (product.category === ProductCategory.PERIPHERAL) {
      return [product.peripheralType, ...(product.bestFor ?? []).slice(0, 2)];
    }

    return [];
  }

  private buildBrandLogos(product: CatalogProduct): Array<{ src: string; alt: string }> {
    if (product.category === ProductCategory.ASSEMBLED) {
      return product.brandLogos.map((logo) => ({ src: logo.logo, alt: logo.name }));
    }

    const highlights = this.productsService.toSpecHighlights(product, 1);
    const brand = highlights[0]?.value;
    if (!brand) {
      return [];
    }

    return [];
  }

  private buildCertificationImage(product: CatalogProduct): string | undefined {
    if (product.category !== ProductCategory.ASSEMBLED) {
      return undefined;
    }

    return product.certifications.image ||
      (product.certifications.certificate === '80+ Bronze'
        ? 'assets/img/certificaciones/80_Plus_Bronze.svg.png'
        : 'assets/img/certificaciones/80plusgold.png');
  }

  private buildCertificationText(product: CatalogProduct): string | undefined {
    if (product.category !== ProductCategory.ASSEMBLED) {
      return undefined;
    }

    return `${product.certifications.certificate} · ${product.certifications.wattage}W`;
  }

  private buildInventoryLabel(product: CatalogProduct): string {
    if (product.stock <= 0) {
      return 'Producto sin stock';
    }

    if (product.stock <= 1) {
      return 'Ultima unidad disponible';
    }

    if (product.stock <= (product.lowStockThreshold ?? 2)) {
      return 'Inventario limitado';
    }

    return 'Disponible para cotizacion';
  }

  private updateMetaTags(product: CatalogProduct): void {
    const title = product.metaTitle ?? `${product.title} | PC Gamer CDMX`;
    const description =
      product.metaDescription ??
      product.description ??
      `Consulta ${product.title} dentro del catalogo de PC Gamer CDMX.`;
    const detailUrl =
      product.category === ProductCategory.ASSEMBLED
        ? `https://pcgamercdmx.com/ensambles/${product.slug}`
        : `https://pcgamercdmx.com/productos/${product.slug}`;

    this.seoService.update({
      title,
      description,
      keywords: [...(product.keywords ?? []), product.title, product.subcategory].join(', '),
      image: product.image,
      url: detailUrl,
      type: 'product',
    });
  }

  private syncNotFoundFallback(): void {
    const isAssemblyRoute = this.router.url.startsWith('/ensambles');
    this.notFoundRootLink = isAssemblyRoute ? '/ensambles' : '/productos';
    this.notFoundRootLabel = isAssemblyRoute
      ? 'Volver a ensambles'
      : 'Volver al catalogo';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
