import {
  Component,
  OnInit,
  OnDestroy,
  NgZone,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';

// Importar los componentes de slider
import { HeroSliderComponent } from '../../shared/components/sliders/hero-slider/hero-slider.component';
import { ProductsSliderComponent } from '../../shared/components/sliders/products-slider/products-slider.component';
import { NeedsSliderComponent } from '../../shared/components/sliders/needs-slider/needs-slider.component';
import { PeripheralsSliderComponent } from '../../shared/components/sliders/peripherals-slider/peripherals-slider.component';
import { BannersSliderComponent } from '../../shared/components/sliders/banners-slider/banners-slider.component';
import { BrandsSectionComponent } from '../../shared/components/brands-section/brands-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeroSliderComponent,
    ProductsSliderComponent,
    NeedsSliderComponent,
    PeripheralsSliderComponent,
    BannersSliderComponent,
    BrandsSectionComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // Slider superior derecho
  sliderImages = [
    {
      id: 1,
      src: 'https://picsum.photos/id/11/200/100',
      link: '/productos/1',
      alt: 'Slider 1',
    },
    {
      id: 2,
      src: 'https://picsum.photos/id/12/200/100',
      link: '/productos/2',
      alt: 'Slider 2',
    },
    {
      id: 3,
      src: 'https://picsum.photos/id/13/200/100',
      link: '/productos/3',
      alt: 'Slider 3',
    },
  ];
  sliderIndex = 0;

  // Imagen de PC usando Lorem Picsum
  pcBuilds = [
    { img: 'assets/img/gabinetes/BR-938686_1.png', link: '/productos/1' },
    { img: 'assets/img/gabinetes/HBJNKHGNM.png', link: '/productos/2' },
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

  influencers = [
    {
      name: 'GamerMX',
      image: 'https://picsum.photos/id/237/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'TechGirl',
      image: 'https://picsum.photos/id/238/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'ProPlayer',
      image: 'https://picsum.photos/id/239/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'StreamQueen',
      image: 'https://picsum.photos/id/240/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'PCMaster',
      image: 'https://picsum.photos/id/241/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'GameDev',
      image: 'https://picsum.photos/id/242/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'ContentCreator',
      image: 'https://picsum.photos/id/243/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'RTXPower',
      image: 'https://picsum.photos/id/244/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
    {
      name: 'CPUOverclock',
      image: 'https://picsum.photos/id/245/300/300',
      social: {
        twitch: 'https://twitch.tv',
        instagram: 'https://instagram.com',
      },
    },
  ];

  pcNeeds = [
    {
      id: 'streaming',
      title: 'Streaming Profesional',
      description: 'PC para transmisiones en vivo de alta calidad.',
      bgImage: 'https://picsum.photos/id/201/500/500',
    },
    {
      id: 'gaming',
      title: 'Gaming Competitivo',
      description: 'Máximo rendimiento para e-sports y torneos.',
      bgImage: 'https://picsum.photos/id/202/500/500',
    },
    {
      id: 'content',
      title: 'Creación de Contenido',
      description: 'Edición de video y renderizado optimizado.',
      bgImage: 'https://picsum.photos/id/203/500/500',
    },
    {
      id: 'design',
      title: 'Diseño 3D',
      description: 'Modelado y renderizado profesional.',
      bgImage: 'https://picsum.photos/id/204/500/500',
    },
    {
      id: 'ai',
      title: 'Inteligencia Artificial',
      description: 'Entrenamiento de modelos y deep learning.',
      bgImage: 'https://picsum.photos/id/205/500/500',
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
  private _intervalId: any;

  // Productos para el carrusel de ensambles
  carruselProducts = [
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
            propsToCheck.push(logo.src, logo.alt, logo.position);
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
  fullText = 'El futuro es hoy, oíste viejo!\nBienvenido a Pc Gamer CDMX.';
  private typingSubscription?: Subscription;

  // Datos para el slider de banners promocionales
  banners = [
    {
      id: 1,
      title: 'Ensambles Personalizados',
      description:
        'Construimos la PC de tus sueños con los mejores componentes y la máxima calidad.',
      imageUrl: 'assets/img/banners/custom-builds.jpg',
      link: '/ensambles-personalizados',
      ctaText: 'Personaliza tu PC',
      badgeText: 'POPULAR',
    },
    {
      id: 2,
      title: 'Ofertas Especiales',
      description:
        'Aprovecha nuestras promociones exclusivas con descuentos de hasta 30% en productos seleccionados.',
      imageUrl: 'assets/img/banners/special-offers.jpg',
      link: '/ofertas',
      ctaText: 'Ver Ofertas',
      badgeText: 'OFERTA',
    },
    {
      id: 3,
      title: 'Sorteos Mensuales',
      description:
        'Participa en nuestros sorteos mensuales y gana componentes premium para tu setup.',
      imageUrl: 'assets/img/banners/giveaways.jpg',
      link: '/sorteos',
      ctaText: 'Participar Ahora',
      badgeText: 'SORTEO',
    },
  ];

  // Control del índice actual del banner
  bannerIndex = 0;
  private bannerIntervalId: any;
  @ViewChild('bannersSlider') bannersSlider?: BannersSliderComponent;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

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
    // Encapsulamos las operaciones del navegador para evitar problemas con SSR
    if (typeof window !== 'undefined') {
      console.log('Home component initialized');

      setTimeout(() => {
        console.log('Starting typing effect');
        this.startTypingWithObservable();
      }, 500);

      // Añade la rotación de imágenes del slider y PC
      this._intervalId = setInterval(() => {
        this.ngZone.run(() => {
          this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
          this.pcIndex = (this.pcIndex + 1) % this.pcBuilds.length;
          this.cdr.detectChanges();
        });
      }, 4000);

      window.addEventListener('load', () => {
        console.log('Window fully loaded');
      });

      this.checkForLoadingIssues();
    }
  }

  // Método para diagnosticar problemas de carga
  checkForLoadingIssues(): void {
    console.log('Checking for loading issues...');

    // Verificar si hay muchas suscripciones activas (posible memory leak)
    setTimeout(() => {
      console.log('Active subscriptions check');
      if (this.typingSubscription) {
        console.log('Typing subscription is active');
      }

      // Comprobar si hay muchas imágenes sin cargar
      const images = document.querySelectorAll('img');
      let pendingImages = 0;

      images.forEach((img) => {
        if (!img.complete) {
          pendingImages++;
        }
      });

      console.log(`Pending images: ${pendingImages}/${images.length}`);

      // Verificar si hay demasiados logs (puede ralentizar la aplicación)
      if (console.log.toString().indexOf('native code') === -1) {
        console.warn(
          'Console logging might be overridden, which can cause performance issues'
        );
      }
    }, 2000);
  }

  ngAfterViewInit() {
    // Ya no necesitamos calcular dimensiones aquí, los componentes de slider lo manejan internamente
  }

  // Método para detectar si estamos en un dispositivo móvil
  isMobile(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // 768px es el breakpoint md en Tailwind
    }
    return false;
  }

  // Mejorar manejo de errores en imágenes
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      console.warn(`Failed to load image: ${img.src}`);
      img.src = 'https://picsum.photos/id/204/400/400'; // Ruta a una imagen predeterminada
      img.onerror = null; // Evita bucles infinitos
    }
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
            // Eliminar el log para reducir la sobrecarga
            // console.log('Current text:', this.typingText);
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        complete: () => {
          console.log('Typing effect completed');
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
    console.log('Home component destroyed - cleaning up resources');

    // Limpiar todas las suscripciones y timers
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
      this.typingSubscription = undefined;
    }

    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    // Limpiar el intervalo de los banners
    if (this.bannerIntervalId) {
      clearInterval(this.bannerIntervalId);
      this.bannerIntervalId = null;
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

  // Variable para almacenar el case seleccionado para el modal
  selectedCustomCase: any = null;

  // Método para abrir el modal de custom case
  openCustomCaseModal(customCase: any): void {
    this.selectedCustomCase = customCase;
    console.log('Abriendo modal para:', customCase.title);
  }

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

  peripherals = [
    {
      id: 1,
      name: 'Razer DeathAdder V2',
      category: 'mouse',
      image: 'https://picsum.photos/id/201/400/400',
      price: 1299,
      originalPrice: 1499,
      discount: 13,
      rating: 4.8,
      slug: 'razer-deathadder-v2',
    },
    {
      id: 2,
      name: 'HyperX Alloy FPS Pro',
      category: 'keyboard',
      image: 'https://picsum.photos/id/202/400/400',
      price: 1799,
      originalPrice: 1999,
      discount: 10,
      rating: 4.7,
      slug: 'hyperx-alloy-fps-pro',
    },
    {
      id: 3,
      name: 'Logitech G Pro X',
      category: 'headset',
      image: 'https://picsum.photos/id/203/400/400',
      price: 2299,
      originalPrice: 2599,
      discount: 12,
      rating: 4.9,
      slug: 'logitech-g-pro-x',
    },
    {
      id: 4,
      name: 'Corsair T1 Race',
      category: 'chair',
      image: 'https://picsum.photos/id/204/400/400',
      price: 5499,
      originalPrice: 6299,
      discount: 13,
      rating: 4.6,
      slug: 'corsair-t1-race',
    },
    {
      id: 5,
      name: 'ASUS TUF Gaming VG27AQ',
      category: 'monitor',
      image: 'assets/img/marcas/asuspng.png',
      price: 8999,
      originalPrice: 9999,
      discount: 10,
      rating: 4.8,
      slug: 'asus-tuf-vg27aq',
    },
    {
      id: 6,
      name: 'Xbox Elite Controller Series 2',
      category: 'gamepad',
      image: 'https://picsum.photos/id/206/400/400',
      price: 3299,
      originalPrice: 3799,
      discount: 13,
      rating: 4.9,
      slug: 'xbox-elite-controller-series-2',
    },
    {
      id: 7,
      name: 'SteelSeries Arctis 7',
      category: 'headset',
      image: 'assets/img/marcas/Logitechpngg.png',
      price: 2799,
      originalPrice: 3199,
      discount: 12,
      rating: 4.7,
      slug: 'steelseries-arctis-7',
    },
    {
      id: 8,
      name: 'Logitech G502 HERO',
      category: 'mouse',
      image: 'https://picsum.photos/id/208/400/400',
      price: 1399,
      originalPrice: 1699,
      discount: 18,
      rating: 4.8,
      slug: 'logitech-g502-hero',
    },
    {
      id: 9,
      name: 'Razer BlackWidow Elite',
      category: 'keyboard',
      image: 'https://picsum.photos/id/209/400/400',
      price: 2999,
      originalPrice: 3499,
      discount: 14,
      rating: 4.6,
      slug: 'razer-blackwidow-elite',
    },
    {
      id: 10,
      name: 'AOC C27G2Z 27" Curvo 240Hz',
      category: 'monitor',
      image: 'https://picsum.photos/id/210/400/400',
      price: 7299,
      originalPrice: 7999,
      discount: 9,
      rating: 4.5,
      slug: 'aoc-c27g2z',
    },
  ];

  // Control de navegación de periféricos
  selectedPeripheralCategory = 0;
  peripheralScrollPosition = 0;
  peripheralScrollStep = 300;

  get filteredPeripherals() {
    const selectedCategory =
      this.peripheralCategories[this.selectedPeripheralCategory].value;
    return selectedCategory === 'all'
      ? this.peripherals
      : this.peripherals.filter((p) => p.category === selectedCategory);
  }

  selectPeripheralCategory(index: number) {
    this.selectedPeripheralCategory = index;
    this.peripheralScrollPosition = 0; // Reset scroll position when category changes
  }

  scrollPeripheralsLeft() {
    // Ajustamos para mostrar más elementos por clic
    const scrollStep = this.peripheralScrollStep * 2;
    this.peripheralScrollPosition = Math.max(
      0,
      this.peripheralScrollPosition - scrollStep
    );
  }

  scrollPeripheralsRight() {
    const maxScroll = this.getMaxPeripheralScroll();

    // Si estamos cerca del final, nos vamos directamente al final para mostrar el último elemento
    if (
      this.peripheralScrollPosition + this.peripheralScrollStep * 2 >=
      maxScroll * 0.8
    ) {
      this.peripheralScrollPosition = maxScroll;
    } else {
      // Ajustamos para mostrar más elementos por clic
      const scrollStep = this.peripheralScrollStep * 2;
      this.peripheralScrollPosition = Math.min(
        maxScroll,
        this.peripheralScrollPosition + scrollStep
      );
    }

    console.log(
      `Current scroll: ${this.peripheralScrollPosition}, Max: ${maxScroll}`
    );
  }

  getMaxPeripheralScroll(): number {
    if (typeof window !== 'undefined') {
      // 1. Cálculo preciso del ancho total del contenido
      const totalItems = this.filteredPeripherals.length;
      // Ajustamos el ancho para considerar el padding interno, bordes, etc.
      const itemWidth = 300; // 250px de ancho base + bordes y márgenes
      const gap = 24; // 6 * 4px (gap-6 en Tailwind)

      // 2. Ancho total del slider (suma de todos los items con sus gaps)
      const totalContentWidth = totalItems * itemWidth + (totalItems - 1) * gap;

      // 3. Ancho visible del contenedor (viewport)
      let containerWidth = 0;
      if (window.innerWidth > 1280) {
        containerWidth = 1140; // max-w-7xl con padding
      } else if (window.innerWidth > 768) {
        containerWidth = window.innerWidth - 90;
      } else {
        containerWidth = window.innerWidth - 40;
      }

      // 4. Margen extra para garantizar que el último producto sea totalmente visible
      const extraMargin = 50;

      // 5. Cálculo final: el desplazamiento máximo es la diferencia total menos el viewport
      const maxScroll = Math.max(
        0,
        totalContentWidth - containerWidth + extraMargin
      );

      console.log(`Slider info - Items: ${totalItems}, Content Width: ${totalContentWidth}, 
                  Container: ${containerWidth}, Max Scroll: ${maxScroll}`);
      return maxScroll;
    }
    return 0;
  }
}
