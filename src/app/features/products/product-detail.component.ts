import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CatalogProduct,
  ProductCardViewModel,
  ProductsService,
} from './services/products.service';
import { ProductCategory } from '../../shared/models';

interface DetailViewModel {
  title: string;
  description: string;
  image: string;
  gallery: string[];
  price: number;
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

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly productsService: ProductsService,
    private readonly meta: Meta,
    private readonly title: Title
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.loadProduct(params['slug']);
    });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.notFound = false;

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
          return;
        }

        this.product = product;
        this.detail = this.buildDetailViewModel(product);
        this.updateMetaTags(product);
        this.loadRelatedProducts(product.slug);
        this.loading = false;
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
      });
  }

  goToProduct(slug: string): void {
    this.router.navigate(['/productos', slug]);
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

    const message = encodeURIComponent(
      `Hola, me interesa el producto ${this.product?.title}. Quiero una cotizacion personalizada.`
    );
    window.open(`https://wa.me/5215555555555?text=${message}`, '_blank');
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/img/gabinetes/BR-938686_1.png';
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

    return {
      title: product.title,
      description: product.fullDescription ?? product.description,
      image: product.image,
      gallery: product.images?.length ? product.images : [product.image],
      price: product.price,
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
      return [
        ...shared,
        { label: 'Motherboard', value: product.specifications.motherboard.title },
        {
          label: 'Uso recomendado',
          value: product.useCase.charAt(0).toUpperCase() + product.useCase.slice(1),
        },
      ];
    }

    if (product.category === ProductCategory.COMPONENT) {
      return shared;
    }

    if (product.category === ProductCategory.PERIPHERAL) {
      return shared;
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
        `${product.certifications.wattage}W`,
      ];
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

    return product.certifications.certificate === '80+ Bronze'
      ? 'assets/img/certificaciones/80_Plus_Bronze.svg.png'
      : 'assets/img/certificaciones/80plusgold.png';
  }

  private buildCertificationText(product: CatalogProduct): string | undefined {
    if (product.category !== ProductCategory.ASSEMBLED) {
      return undefined;
    }

    return `${product.certifications.certificate} · ${product.certifications.wattage}W`;
  }

  private buildInventoryLabel(product: CatalogProduct): string {
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

    this.title.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'keywords',
      content: [...(product.keywords ?? []), product.title, product.subcategory].join(', '),
    });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: product.image });
    this.meta.updateTag({
      property: 'og:url',
      content: `https://pcgamercdmx.com/productos/${product.slug}`,
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
