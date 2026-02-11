import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductsService, Product } from './services/products.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  notFound = false;
  mainImageIndex = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private meta: Meta,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const slug = params['slug'];
        this.loadProduct(slug);
      });
  }

  loadProduct(slug: string): void {
    this.loading = true;
    this.productsService
      .getProductBySlug(slug)
      .pipe(takeUntil(this.destroy$))
      .subscribe((product) => {
        if (product) {
          this.product = product;
          this.loadRelatedProducts(product.slug);
          this.updateMetaTags(product);
        } else {
          this.notFound = true;
        }
        this.loading = false;
      });
  }

  loadRelatedProducts(slug: string): void {
    this.productsService
      .getRelatedProducts(slug, 4)
      .pipe(takeUntil(this.destroy$))
      .subscribe((products) => {
        this.relatedProducts = products;
      });
  }

  updateMetaTags(product: Product): void {
    // Actualizar título de la página
    this.title.setTitle(`${product.title} | PC Gamer CDMX`);

    // Actualizar meta tags para SEO
    this.meta.updateTag({
      name: 'description',
      content: product.description || `${product.title} - Catálogo de PCs Gaming`,
    });

    this.meta.updateTag({
      name: 'keywords',
      content: `${product.title}, ${product.processor}, ${product.graphicsCard}, PC gaming`,
    });

    // Open Graph tags para redes sociales
    this.meta.updateTag({
      property: 'og:title',
      content: product.title,
    });

    this.meta.updateTag({
      property: 'og:description',
      content: product.description || `${product.title} - Catálogo de PCs Gaming`,
    });

    this.meta.updateTag({
      property: 'og:image',
      content: product.image,
    });

    this.meta.updateTag({
      property: 'og:url',
      content: `https://pcgamercdmx.com/productos/${product.slug}`,
    });
  }

  goToProduct(slug: string): void {
    this.router.navigate(['/productos', slug]);
  }

  openWhatsApp(): void {
    const message = encodeURIComponent(
      `Hola! Me interesa obtener más información sobre el producto: ${this.product?.title}`
    );
    window.open(`https://wa.me/5215555555555?text=${message}`, '_blank');
  }

  requestQuote(): void {
    // Mostrar formulario de contacto o redirigir
    this.router.navigate(['/contacto'], {
      queryParams: { product: this.product?.slug },
    });
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://picsum.photos/id/204/400/400';
      img.onerror = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

