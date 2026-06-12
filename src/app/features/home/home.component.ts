import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
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
import { HomeBlogSectionComponent } from './components/home-blog-section.component';
import { HomeCommunitySectionComponent } from './components/home-community-section.component';
import { HomeCustomCasesSectionComponent } from './components/home-custom-cases-section.component';
import { HomeProjectRequestSectionComponent } from './components/home-project-request-section.component';
import { HomeServicesSectionComponent } from './components/home-services-section.component';
import { HomeContentService, HomeEvent, HomeHeroBanner } from './services/home-content.service';

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

  // Slider superior derecho - -
  sliderImages: HomeHeroBanner[] = [
    {
      id: 'hero-nzxt-h9',
      src: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png',
      link: '/ensambles',
      alt: 'Slider 1',
      active: true,
      sortOrder: 1,
    },
    {
      id: 'hero-hbjnkhgnm',
      src: 'assets/img/gabinetes/HBJNKHGNM.png',
      link: '/ensambles',
      alt: 'Slider 2',
      active: true,
      sortOrder: 2,
    },
    {
      id: 'hero-product-section',
      src: 'assets/img/gabinetes/product-section-01.png',
      link: '/ensambles',
      alt: 'Slider 3',
      active: true,
      sortOrder: 3,
    },
  ];
  sliderIndex = 0;

  // Imagen de PCs para el slider inferior derecho
  pcBuilds = [
    { img: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png', link: '/ensambles/cpu-pre-armado-1' },
    { img: 'assets/img/gabinetes/HBJNKHGNM.png', link: '/ensambles/cpu-pre-armado-2' },
    { img: 'assets/img/gabinetes/product-section-01.png', link: '/ensambles/cpu-pre-armado-3' },
  ];
  pcIndex = 0;

  // Datos para las nuevas secciones
  popularGames = [
    {
      title: 'Cyberpunk 2077',
      image: 'https://picsum.photos/id/231/600/400',
      fps: '120+',
      specs: 'RTX 4070 | Ultra Settings',
    },
    {
      title: 'Call of Duty: Modern Warfare',
      image: 'https://picsum.photos/id/232/600/400',
      fps: '144+',
      specs: 'RTX 4060 | High Settings',
    },
    {
      title: 'Fortnite',
      image: 'https://picsum.photos/id/233/600/400',
      fps: '240+',
      specs: 'RTX 4080 | Competitive Settings',
    },
    {
      title: 'League of Legends',
      image: 'https://picsum.photos/id/234/600/400',
      fps: '360+',
      specs: 'RTX 3060 | Max Settings',
    },
    {
      title: 'GTA V',
      image: 'https://picsum.photos/id/235/600/400',
      fps: '100+',
      specs: 'RTX 3070 | Very High Settings',
    },
    {
      title: 'Valorant',
      image: 'https://picsum.photos/id/236/600/400',
      fps: '400+',
      specs: 'GTX 1660 | Max Settings',
    },
  ];

  influencers: CommunityCollaborator[] = [];

  pcNeeds = [
    {
      id: 'streaming',
      title: 'Streaming Profesional',
      description: 'PC para transmisiones en vivo de alta calidad.',
      bgImage: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png',
    },
    {
      id: 'gaming',
      title: 'Gaming Competitivo',
      description: 'Máximo rendimiento para e-sports y torneos.',
      bgImage: 'assets/img/gabinetes/HBJNKHGNM.png',
    },
    {
      id: 'content',
      title: 'Creación de Contenido',
      description: 'Edición de video y renderizado optimizado.',
      bgImage: 'assets/img/gabinetes/product-section-01.png',
    },
    {
      id: 'design',
      title: 'Diseño 3D',
      description: 'Modelado y renderizado profesional.',
      bgImage: 'assets/img/gabinetes/rog-hyperion-gr701.png',
    },
    {
      id: 'ai',
      title: 'Inteligencia Artificial',
      description: 'Entrenamiento de modelos y deep learning.',
      bgImage: 'assets/img/gabinetes/BR-938686_2.png',
    },
  ];

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

  latestPosts = [
    {
      title: 'Las mejores tarjetas gráficas para 2024',
      excerpt:
        'Analizamos las mejores opciones de Nvidia y AMD para cada presupuesto.',
      image: 'https://picsum.photos/id/211/600/400',
      date: new Date('2023-12-15'),
      slug: 'mejores-tarjetas-graficas-2024',
    },
    {
      title: 'Guía para overclock seguro de CPU',
      excerpt:
        'Todo lo que necesitas saber para aumentar el rendimiento de tu procesador sin riesgos.',
      image: 'https://picsum.photos/id/212/600/400',
      date: new Date('2023-12-10'),
      slug: 'guia-overclock-seguro-cpu',
    },
    {
      title: 'Cómo configurar tu PC para streaming',
      excerpt:
        'Ajustes de OBS, hardware recomendado y consejos de profesionales.',
      image: 'https://picsum.photos/id/213/600/400',
      date: new Date('2023-12-05'),
      slug: 'configurar-pc-para-streaming',
    },
  ];

  // Variable para almacenar referencia al intervalo
  private rotationIntervalId: ReturnType<typeof setInterval> | null = null;

  // Productos para el carrusel de ensambles
  carruselProducts: Product[] = [
    {
      id: 1,
      title: 'CPU PRE ARMADO 1',
      image: 'assets/img/gabinetes/BR-938686_1.png',
      price: 11999,
      processor: 'AMD RYZEN 7 5700',
      motherboard: 'ASUS ROG STRIX B550-F',
      ram: '16 GB DDR4',
      storage: 'SSD M.2 NVME 1TB',
      graphicsCard: 'NVIDIA RTX 3060',
      slug: 'cpu-pre-armado-1',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
    },
    {
      id: 2,
      title: 'CPU PRE ARMADO 2',
      image: 'assets/img/gabinetes/HBJNKHGNM.png',
      price: 15999,
      processor: 'INTEL CORE i5-12400F',
      motherboard: 'ASUS PRIME B660M-A',
      ram: '32 GB DDR4',
      storage: 'SSD M.2 NVME 1TB',
      graphicsCard: 'NVIDIA RTX 3070',
      slug: 'cpu-pre-armado-2',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
    },
    {
      id: 3,
      title: 'CPU PRE ARMADO 3',
      image: 'assets/img/gabinetes/product-section-01.png',
      price: 21999,
      processor: 'AMD RYZEN 9 5900X',
      motherboard: 'ASUS ROG STRIX X570-E',
      ram: '32 GB DDR4',
      storage: 'SSD M.2 NVME 2TB',
      graphicsCard: 'NVIDIA RTX 3080',
      slug: 'cpu-pre-armado-3',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
    },
    {
      id: 4,
      title: 'CPU PRE ARMADO 4',
      image: 'assets/img/gabinetes/rog-hyperion-gr701.png',
      price: 29999,
      processor: 'INTEL CORE i9-12900K',
      motherboard: 'ASUS ROG MAXIMUS Z690 HERO',
      ram: '64 GB DDR5',
      storage: 'SSD M.2 NVME 2TB',
      graphicsCard: 'NVIDIA RTX 4080',
      slug: 'cpu-pre-armado-4',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
    },
    {
      id: 5,
      title: 'CPU PRE ARMADO 5',
      image: 'assets/img/gabinetes/rog-hyperion-gr701.png',
      price: 34999,
      processor: 'AMD RYZEN 9 5950X',
      motherboard: 'ASUS ROG CROSSHAIR VIII HERO',
      ram: '64 GB DDR4',
      storage: 'SSD M.2 NVME 2TB',
      graphicsCard: 'NVIDIA RTX 4090',
      slug: 'cpu-pre-armado-5',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
    },
  ];

  public filteredCarruselProducts = [...this.carruselProducts];
  public searchTerm: string = '';
  public wasFiltered: boolean = false;
  public filterProducts(): void {
    const term = this.searchTerm.toLowerCase().trim();
    const wasFilteredBefore = this.wasFiltered;
    
    if (term === '') {
      // No filter term, show all products
      this.filteredCarruselProducts = [...this.carruselProducts];
      this.wasFiltered = false;
    } else {
      // Filter products based on search term
      this.filteredCarruselProducts = this.carruselProducts.filter((product) => {
        const propsToCheck = [
          product.title,
          product.processor,
          product.motherboard,
          product.ram,
          product.storage,
          product.graphicsCard,
          product.price?.toString(),
          product.slug,
          product.image,
          product.powerCertificate,
          product.watts?.toString(),
          product.id?.toString(),
        ];

        if (Array.isArray(product.brandLogos)) {
          product.brandLogos.forEach((logo) => {
            propsToCheck.push(logo.src, logo.alt, logo.position ?? '');
          });
        }

        return propsToCheck.some(
          (prop) => typeof prop === 'string' && prop.toLowerCase().includes(term)
        );
      });
      this.wasFiltered = true;
    }
  }

  public onCarouselReset(): void {
    if (this.wasFiltered) {
      this.wasFiltered = false;
    }
  }

  // Para el efecto typing - usando un enfoque con Observable para mejor fiabilidad
  typingText = '';
  fullText = 'El futuro es hoy, oíste viejo!?\nBienvenido a Pc Gamer CDMX.';
  private typingSubscription?: Subscription;

  // Datos para el slider de banners promocionales
  banners: any[] = [
    {
      id: 1,
      title: 'Ensambles Personalizados',
      description:
        'Construimos la PC de tus sueños con los mejores componentes y la máxima calidad.',
      imageUrl: 'assets/img/gabinetes/Gabinete-NZXT-H9-Flow-01.png',
      link: '/cotiza-tu-pc',
      ctaText: 'Personaliza tu PC',
      badgeText: 'POPULAR',
    },
    {
      id: 2,
      title: 'Ofertas Especiales',
      description:
        'Aprovecha nuestras promociones exclusivas con descuentos de hasta 30% en productos seleccionados.',
      imageUrl: 'assets/img/gabinetes/product-section-01.png',
      link: '/productos',
      ctaText: 'Ver Ofertas',
      badgeText: 'OFERTA',
    },
    {
      id: 3,
      title: 'Sorteos Mensuales',
      description:
        'Participa en nuestros sorteos mensuales y gana componentes premium para tu setup.',
      imageUrl: 'assets/img/gabinetes/rog-hyperion-gr701.png',
      link: '/sorteos',
      ctaText: 'Participar Ahora',
      badgeText: 'SORTEO',
    },
  ];

  // Control del índice actual del banner
  bannerIndex = 0;
  showUpcomingEvents = true;
  upcomingEvents: HomeEvent[] = [];
  @ViewChild('bannersSlider') bannersSlider?: BannersSliderComponent;
  private homeContentSubscription?: Subscription;

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private productsService: ProductsService,
    private communityService: CommunityService,
    private homeContentService: HomeContentService
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
    this.peripherals = this.shuffleItems(this.peripherals);
    this.loadRandomAssemblies();
    this.loadRandomPeripherals();
    this.loadFeaturedCollaborators();
    this.loadHomeContent();

    // Encapsulamos las operaciones del navegador para evitar problemas con SSR
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.startTypingWithObservable();
      }, 500);

      // Añade la rotación de imágenes del slider y PC
      this.rotationIntervalId = setInterval(() => {
        this.ngZone.run(() => {
          if (this.sliderImages.length) {
            this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
          }
          this.pcIndex = (this.pcIndex + 1) % this.pcBuilds.length;
          this.cdr.detectChanges();
        });
      }, 4000);

    }
  }

  private loadHomeContent(): void {
    this.homeContentSubscription = this.homeContentService.getSettings().subscribe((settings) => {
      this.banners = settings.banners
        .filter((banner) => banner.active)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      this.sliderImages = settings.heroBanners
        .filter((banner) => banner.active)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      this.showUpcomingEvents = settings.showUpcomingEvents;
      this.upcomingEvents = settings.events.filter((event) => event.active);
      this.cdr.detectChanges();
    });
  }

  private loadRandomPeripherals(): void {
    this.productsService.getPeripherals().subscribe({
      next: (products) => {
        const items = this.shuffleItems(products)
          .slice(0, 18)
          .map((product, index) => this.toPeripheralSliderItem(product, index));

        if (items.length) {
          this.peripherals = items;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.peripherals = [];
        this.cdr.detectChanges();
      },
    });
  }

  private loadRandomAssemblies(): void {
    this.productsService.getAssembledPCs().subscribe({
      next: (products) => {
        const items = this.shuffleItems(products)
          .slice(0, 12)
          .map((product, index) => this.toPackageSliderItem(product, index));

        if (items.length) {
          this.carruselProducts = items;
          this.filteredCarruselProducts = [...items];
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.carruselProducts = this.shuffleItems(this.carruselProducts);
        this.filteredCarruselProducts = [...this.carruselProducts];
        this.cdr.detectChanges();
      },
    });
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
      brandLogos: this.getPackageBrandLogos(product, processor, graphicsCard, motherboard),
      powerCertificate: this.getPowerCertificateImage(product.certifications.certificate),
      watts: product.certifications.wattage,
      category: 'paquete',
      description: product.description,
    };
  }

  private getPackageBrandLogos(
    product: AssembledPC,
    processor: string,
    graphicsCard: string,
    motherboard: string
  ): Array<{ src: string; alt: string }> {
    const logos = product.brandLogos
      .map((logo) => ({ src: logo.logo, alt: logo.name }))
      .filter((logo) => logo.src && logo.alt);

    const componentText = `${processor} ${graphicsCard} ${motherboard}`.toLowerCase();
    const derivedLogos = [
      {
        match: componentText.includes('nvidia') || componentText.includes('rtx') || componentText.includes('gtx'),
        src: 'assets/img/marcas/nvidia_tag.svg',
        alt: 'NVIDIA',
      },
      {
        match: componentText.includes('amd') || componentText.includes('ryzen') || componentText.includes('radeon'),
        src: 'assets/img/marcas/ryzen_tag.svg',
        alt: 'AMD Ryzen',
      },
      {
        match: componentText.includes('intel') || componentText.includes('core ultra') || componentText.includes('core i'),
        src: 'assets/img/marcas/intel_tag.svg',
        alt: 'Intel',
      },
      {
        match: componentText.includes('asus') || componentText.includes('rog'),
        src: 'assets/img/marcas/asuspng.png',
        alt: 'ASUS',
      },
      {
        match: componentText.includes('gigabyte') || componentText.includes('aorus'),
        src: 'assets/img/marcas/gigabyte.png',
        alt: 'Gigabyte',
      },
      {
        match: componentText.includes('corsair'),
        src: 'assets/img/marcas/corsairbrand.png',
        alt: 'Corsair',
      },
    ]
      .filter((logo) => logo.match)
      .map(({ src, alt }) => ({ src, alt }));

    return [...logos, ...derivedLogos]
      .filter((logo, index, all) => all.findIndex((item) => item.alt === logo.alt) === index)
      .slice(0, 4);
  }

  private getPowerCertificateImage(certificate: string): string {
    return certificate === '80+ Bronze'
      ? 'assets/img/certificaciones/80_Plus_Bronze.svg.png'
      : 'assets/img/certificaciones/80plusgold.png';
  }

  private loadFeaturedCollaborators(): void {
    this.communityService.getFeaturedCollaborators(8).subscribe((collaborators) => {
      this.influencers = collaborators;
      this.cdr.detectChanges();
    });
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

  private shuffleItems<T>(items: T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
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

    // Limpiar todas las suscripciones y timers
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = undefined;
    }

    if (this.homeContentSubscription) {
      this.homeContentSubscription.unsubscribe();
      this.homeContentSubscription = undefined;
    }

    if (this.rotationIntervalId) {
      clearInterval(this.rotationIntervalId);
      this.rotationIntervalId = null;
    }
  }

  // Velocidad de escritura en milisegundos
  private typingSpeed = 40;

  // Datos para la sección Custom Case
  customCases = [
    {
      id: 'case001',
      title: 'CyberShadow V3',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0075.jpg',
      description:
        'Gabinete con panel de vidrio templado, refrigeración líquida y luces RGB direccionables.',
      tags: ['RGB', 'Vidrio', 'Refrigeración Líquida'],
    },
    {
      id: 'case002',
      title: 'Neon Pulse',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0059.jpg',
      description:
        'Compacto pero potente, con sistema de iluminación personalizado y cable management optimizado.',
      tags: ['Compacto', 'RGB', 'Silencioso'],
    },
    {
      id: 'case003',
      title: 'Arctic Frost',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0066.jpg',
      description:
        'Diseño blanco minimalista con acentos LED azules y excelente flujo de aire.',
      tags: ['Blanco', 'Airflow', 'Minimalista'],
    },
    {
      id: 'case004',
      title: 'Dragon Fire',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0071.jpg',
      description:
        'Gabinete gaming agresivo con panel lateral de vidrio templado y soporte para múltiples radiadores.',
      tags: ['Gaming', 'RGB', 'ATX'],
    },
    {
      id: 'case005',
      title: 'Phantom Stealth',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0072.jpg',
      description:
        'Diseño negro mate con detalles sutiles y configuración silenciosa.',
      tags: ['Silencioso', 'Negro', 'Minimalista'],
    },
    {
      id: 'case006',
      title: 'Quantum Flux',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0056.jpg',
      description:
        'Gabinete premium con iluminación RGB integrada y soporte para hardware de alta gama.',
      tags: ['Premium', 'E-ATX', 'RGB'],
    },
    {
      id: 'case007',
      title: 'Vortex Core',
      imageUrl: 'assets/img/custom/IMG-20250208-WA0078.jpg',
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
