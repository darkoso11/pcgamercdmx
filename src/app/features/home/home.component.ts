import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { selectFeaturedAssembly } from './home-featured-assembly';
import { HomeVideoComponent } from './components/home-video.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';

// Importar los componentes de slider
import { HeroSliderComponent } from '../../shared/components/sliders/hero-slider/hero-slider.component';
import { ProductsSliderComponent } from '../../shared/components/sliders/products-slider/products-slider.component';
import { PeripheralsSliderComponent } from '../../shared/components/sliders/peripherals-slider/peripherals-slider.component';
import { BannersSliderComponent } from '../../shared/components/sliders/banners-slider/banners-slider.component';
import { BrandsSectionComponent } from '../../shared/components/brands-section/brands-section.component';
import { BUSINESS_INFO } from '../../shared/config/business-info';
import { Product, ProductsService } from '../products/services/products.service';
import { AssembledPC, PeripheralProduct } from '../../shared/models';
import { CommunityCollaborator } from '../community/collaborators.data';
import { CommunityService } from '../community/community.service';
import { BlogService } from '../blog/services/blog.service';
import {
  HomeBlogPost,
  HomeBlogSectionComponent,
} from './components/home-blog-section.component';
import { HomeCommunitySectionComponent } from './components/home-community-section.component';
import { HomeCustomCasesSectionComponent } from './components/home-custom-cases-section.component';
import { HomeProjectRequestSectionComponent } from './components/home-project-request-section.component';
import { HomeServicesSectionComponent } from './components/home-services-section.component';
import { DEFAULT_HOME_CONTENT_SETTINGS, HomeBanner, HomeContentService, HomeEvent, HomeHeroBanner } from './services/home-content.service';

interface HomePeripheralItem {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  slug: string;
  inStock: boolean;
  inventoryLabel: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HomeVideoComponent,
    RouterModule,
    HeroSliderComponent,
    ProductsSliderComponent,
    PeripheralsSliderComponent,
    BannersSliderComponent,
    BrandsSectionComponent,
    HomeBlogSectionComponent,
    HomeCommunitySectionComponent,
    HomeCustomCasesSectionComponent,
    HomeProjectRequestSectionComponent,
    HomeServicesSectionComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  readonly business = BUSINESS_INFO;
  featuredAssembly: AssembledPC | null = null;
  private static lastFeaturedImage: string | null = null;
  private homeProductsSubscription?: Subscription;
  // Set only after the authorized media and its audio track have been verified.
  readonly heroVideoSource = 'assets/video/home-pc-gamer-cdmx.mp4';
  readonly heroVideoHasAudio = true;
  readonly logoBanner: HomeHeroBanner = {
    id: 'home-official-logo', src: 'assets/img/leon-160.webp', link: '/',
    alt: 'PC Gamer CDMX', active: true, sortOrder: 0,
  };

  sliderImages: HomeHeroBanner[] = [this.logoBanner, ...DEFAULT_HOME_CONTENT_SETTINGS.heroBanners];

  influencers: CommunityCollaborator[] = [];

  services = [
    {
      title: 'Mantenimiento',
      description:
        'Limpieza profesional de hardware y optimización de software.',
      icon: 'fas fa-tools',
    },
    {
      title: 'Actualización',
      description:
        'Mejora componentes para aumentar rendimiento y compatibilidad.',
      icon: 'fas fa-microchip',
    },
    {
      title: 'Reparación',
      description: 'Diagnóstico y solución de problemas hardware y software.',
      icon: 'fas fa-wrench',
    },
    {
      title: 'Ensamble',
      description: 'Construcción de PC a medida con los mejores componentes.',
      icon: 'fas fa-desktop',
    },
  ];

  latestPosts: HomeBlogPost[] = [];

  // Productos para el carrusel de ensambles
  carruselProducts: Product[] = [];

  // Para el efecto typing - usando un enfoque con Observable para mejor fiabilidad
  typingText = '';
  fullText = 'Bienvenido a Pc Gamer CDMX.';
  private typingSubscription?: Subscription;

  banners: HomeBanner[] = [...DEFAULT_HOME_CONTENT_SETTINGS.banners];

  showUpcomingEvents = true;
  upcomingEvents: HomeEvent[] = [];
  @ViewChild('bannersSlider') bannersSlider?: BannersSliderComponent;
  private homeContentSubscription?: Subscription;
  private typingTimer?: ReturnType<typeof setTimeout>;
  private deferredContentTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private productsService: ProductsService,
    private communityService: CommunityService,
    private homeContentService: HomeContentService,
    private blogService: BlogService
  ) {}

  // Métodos para controlar la navegación de los banners
  nextBanner(): void {
    if (this.bannersSlider) {
      this.bannersSlider.nextSlide();
    }
  }

  previousBanner(): void {
    if (this.bannersSlider) {
      this.bannersSlider.previousSlide();
    }
  }

  ngOnInit(): void {
    this.peripherals = this.orderSliderItems(this.peripherals);

    // Encapsulamos las operaciones del navegador para evitar problemas con SSR
    if (typeof window !== 'undefined') {
      this.deferredContentTimer = setTimeout(() => {
        this.loadHomeSliderProducts();
        this.loadFeaturedCollaborators();
        this.loadHomeContent();
        this.loadLatestPosts();
      }, 3500);
      this.typingTimer = setTimeout(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.typingText = this.fullText;
          this.cdr.detectChanges();
        } else {
          this.startTypingWithObservable();
        }
      }, 500);

    }
  }

  private loadHomeContent(): void {
    this.homeContentSubscription = this.homeContentService.getSettings().subscribe((settings) => {
      this.banners = settings.banners
        .filter((banner) => banner.active)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      this.sliderImages = [this.logoBanner, ...settings.heroBanners
        .filter((banner) => banner.active && banner.src !== this.logoBanner.src)
        .sort((a, b) => a.sortOrder - b.sortOrder)];
      this.showUpcomingEvents = settings.showUpcomingEvents;
      this.upcomingEvents = settings.events.filter((event) => event.active);
      this.cdr.detectChanges();
    });
  }

  private loadHomeSliderProducts(): void {
    this.homeProductsSubscription = this.productsService.getHomeSliderProducts().subscribe({
      next: ({ assemblies, peripherals }) => {
        this.selectHomeAssembly(assemblies);
        const assemblyItems = this.orderSliderItems(assemblies)
          .slice(0, 12)
          .map((product, index) => this.toPackageSliderItem(product, index));
        const peripheralItems = this.orderSliderItems(peripherals)
          .slice(0, 18)
          .map((product, index) => this.toPeripheralSliderItem(product, index));

        this.carruselProducts = assemblyItems;
        if (peripheralItems.length) {
          this.peripherals = peripheralItems;
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.carruselProducts = [];
        this.peripherals = [];
        this.cdr.detectChanges();
      },
    });
  }

  private selectHomeAssembly(assemblies: AssembledPC[]): void {
    let previousImage = HomeComponent.lastFeaturedImage;
    try {
      previousImage = window.sessionStorage.getItem('pcgamer.home.featured-image') ?? previousImage;
    } catch { /* Keep in-memory rotation if storage is unavailable. */ }
    this.featuredAssembly = selectFeaturedAssembly(assemblies, previousImage);
    if (this.featuredAssembly) {
      HomeComponent.lastFeaturedImage = this.featuredAssembly.image;
      try {
        window.sessionStorage.setItem('pcgamer.home.featured-image', this.featuredAssembly.image);
      } catch { /* The catalog link remains usable without storage. */ }
    }
  }

  private toPackageSliderItem(product: AssembledPC, index: number): Product {
    const price = product.discountedPrice ?? product.price;
    const processor = product.specifications.processor.title;
    const motherboard = product.specifications.motherboard.title;
    const graphicsCard = product.specifications.graphicsCard.title;

    return {
      id: product.id ?? index + 1,
      title: product.title,
      image: product.image,
      price,
      processor,
      motherboard,
      ram: product.specifications.ram.title,
      storage: product.specifications.storage.map((item) => item.title).join(' + '),
      graphicsCard,
      slug: product.slug,
      brandLogos: this.getPackageBrandLogos(product),
      powerCertificate:
        product.certifications.image ||
        this.getPowerCertificateImage(product.certifications.certificate),
      powerCertificateName: product.certifications.certificate,
      watts: product.certifications.wattage,
      originalPrice: product.discountedPrice ? product.price : undefined,
      showOfferBadge: Boolean(
        product.discountedPrice && product.offerBadgeVisible
      ),
      category: 'paquete',
      description: product.description,
    };
  }

  private getPackageBrandLogos(product: AssembledPC): Array<{ src: string; alt: string }> {
    return product.brandLogos
      .map((logo) => ({ src: logo.logo, alt: logo.name }))
      .filter((logo) => logo.src && logo.alt)
      .filter((logo, index, all) => all.findIndex((item) => item.alt === logo.alt) === index);
  }

  private getPowerCertificateImage(certificate: string): string {
    return certificate === '80+ Bronze'
      ? 'assets/img/certificaciones/80_Plus_Bronze.svg-80.webp'
      : 'assets/img/certificaciones/80plusgold-80.webp';
  }

  private loadFeaturedCollaborators(): void {
    this.communityService.getFeaturedCollaborators(8).subscribe((collaborators) => {
      this.influencers = collaborators;
      this.cdr.detectChanges();
    });
  }

  private loadLatestPosts(): void {
    this.blogService.listPublished({ limit: 3 }).subscribe({
      next: ({ data }) => {
        this.latestPosts = data.map((article) => ({
          title: article.title,
          excerpt: article.summary || 'Lee la entrada completa en nuestro blog.',
          image: article.coverImage?.url || '',
          date: this.toValidDate(article.publishedAt),
          slug: article.slug || article._id || '',
        }));
        this.cdr.detectChanges();
      },
      error: () => {
        this.latestPosts = [];
        this.cdr.detectChanges();
      },
    });
  }

  private toValidDate(value?: string): Date {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private toPeripheralSliderItem(product: PeripheralProduct, index: number) {
    const originalPrice = product.discountedPrice ? product.price : undefined;
    const price = product.discountedPrice ?? product.price;

    return {
      id: product.id ?? index + 1,
      name: product.title,
      category: this.toHomePeripheralCategory(product),
      image: product.image,
      price,
      originalPrice,
      discount: originalPrice ? this.toDiscountPercent(originalPrice, price) : undefined,
      rating: product.rating?.average ?? 4.8,
      slug: product.slug,
      inStock: product.stock > 0,
      inventoryLabel: product.stock > 0 ? 'Disponible' : 'Sin stock',
    };
  }

  private toHomePeripheralCategory(product: PeripheralProduct): string {
    const type = (product as PeripheralProduct & { peripheralType?: string }).peripheralType;
    const subcategory = product.subcategory?.toLowerCase() ?? '';
    const title = product.title.toLowerCase();
    const text = `${type ?? ''} ${subcategory} ${title}`;

    if (text.includes('tecl') || text.includes('keyboard')) return 'keyboard';
    if (text.includes('headset') || text.includes('auricular') || text.includes('audifono')) return 'headset';
    if (text.includes('monitor')) return 'monitor';
    if (text.includes('silla') || text.includes('chair')) return 'chair';
    if (text.includes('control') || text.includes('mando') || text.includes('gamepad')) return 'gamepad';
    return 'mouse';
  }

  private toDiscountPercent(originalPrice: number, price: number): number | undefined {
    if (!originalPrice || originalPrice <= price) {
      return undefined;
    }

    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  private orderSliderItems<T>(items: T[]): T[] {
    return [...items];
  }


  // Método typing
  startTypingWithObservable(): void {
    // Reiniciar texto
    this.typingText = '';

    // Cancelar suscripción anterior si existe
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }

    // Crear Observable con límite de tiempo para evitar ejecución indefinida
    this.typingSubscription = interval(this.typingSpeed)
      .pipe(
        take(this.fullText.length), // Limitar emisiones al tamaño del texto
        tap((index) => {
          this.ngZone.run(() => {
            this.typingText += this.fullText.charAt(index);
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        complete: () => {
          // Asegurar que la suscripción se limpia
          if (this.typingSubscription) {
            this.typingSubscription.unsubscribe();
            this.typingSubscription = undefined;
          }
        },
        error: (err) => {
          console.error('Error in typing effect:', err);
          // Limpiar recursos en caso de error
          if (this.typingSubscription) {
            this.typingSubscription.unsubscribe();
            this.typingSubscription = undefined;
          }
        },
      });
  }

  // Mejorar método de destrucción para asegurar la limpieza de recursos
  ngOnDestroy(): void {
    this.homeProductsSubscription?.unsubscribe();
    if (this.typingTimer) clearTimeout(this.typingTimer);

    // Limpiar todas las suscripciones y timers
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = undefined;
    }

    if (this.homeContentSubscription) {
      this.homeContentSubscription.unsubscribe();
      this.homeContentSubscription = undefined;
    }

    if (this.deferredContentTimer) {
      clearTimeout(this.deferredContentTimer);
      this.deferredContentTimer = undefined;
    }

  }

  // Velocidad de escritura en milisegundos
  private typingSpeed = 40;

  // Datos para la sección Custom Case
  customCases = [
    {
      id: 'case001',
      title: 'CyberShadow V3',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0075.webp',
      description:
        'Gabinete con panel de vidrio templado, refrigeración líquida y luces RGB direccionables.',
      tags: ['RGB', 'Vidrio', 'Refrigeración Líquida'],
    },
    {
      id: 'case002',
      title: 'Neon Pulse',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0059.webp',
      description:
        'Compacto pero potente, con sistema de iluminación personalizado y cable management optimizado.',
      tags: ['Compacto', 'RGB', 'Silencioso'],
    },
    {
      id: 'case003',
      title: 'Arctic Frost',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0066.webp',
      description:
        'Diseño blanco minimalista con acentos LED azules y excelente flujo de aire.',
      tags: ['Blanco', 'Airflow', 'Minimalista'],
    },
    {
      id: 'case004',
      title: 'Dragon Fire',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0071.webp',
      description:
        'Gabinete gaming agresivo con panel lateral de vidrio templado y soporte para múltiples radiadores.',
      tags: ['Gaming', 'RGB', 'ATX'],
    },
    {
      id: 'case005',
      title: 'Phantom Stealth',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0072.webp',
      description:
        'Diseño negro mate con detalles sutiles y configuración silenciosa.',
      tags: ['Silencioso', 'Negro', 'Minimalista'],
    },
    {
      id: 'case006',
      title: 'Quantum Flux',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0056.webp',
      description:
        'Gabinete premium con iluminación RGB integrada y soporte para hardware de alta gama.',
      tags: ['Premium', 'E-ATX', 'RGB'],
    },
    {
      id: 'case007',
      title: 'Vortex Core',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0078.webp',
      description:
        'Diseño compacto optimizado para máximo rendimiento térmico.',
      tags: ['Compacto', 'Airflow', 'Mini-ITX'],
    },
  ];


  // Datos para sección de periféricos
  peripheralCategories = [
    { name: 'Todo', value: 'all' },
    { name: 'Mouse', value: 'mouse' },
    { name: 'Teclados', value: 'keyboard' },
    { name: 'Auriculares', value: 'headset' },
    { name: 'Sillas Gaming', value: 'chair' },
    { name: 'Monitores', value: 'monitor' },
    { name: 'Mandos', value: 'gamepad' },
  ];

  peripherals: HomePeripheralItem[] = [];

}
