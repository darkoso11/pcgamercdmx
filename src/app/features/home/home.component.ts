import { Component, OnInit, OnDestroy, NgZone, ViewChildren, QueryList, ElementRef, AfterViewInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // Slider superior derecho
  sliderImages = [
    { src: 'https://picsum.photos/id/11/200/100', link: '/productos/1', alt: 'Slider 1' },
    { src: 'https://picsum.photos/id/12/200/100', link: '/productos/2', alt: 'Slider 2' },
    { src: 'https://picsum.photos/id/13/200/100', link: '/productos/3', alt: 'Slider 3' }
  ];
  sliderIndex = 0;

  // Imagen de PC usando Lorem Picsum
  pcBuilds = [
    { img: 'assets/img/gabinetes/BR-938686_1.png', link: '/productos/1' },
    { img: 'assets/img/gabinetes/HBJNKHGNM.png', link: '/productos/2' }
  ];
  pcIndex = 0;

  // Método para el slider de productos
  currentProductIndex = 0;
  
  // Método para ir a un producto específico en el slider
  goToProduct(index: number): void {
    this.currentProductIndex = index;
  }
  
  // Datos para las nuevas secciones
  popularGames = [
    {
      title: 'Cyberpunk 2077',
      image: 'https://picsum.photos/id/231/600/400',
      fps: '120+',
      specs: 'RTX 4070 | Ultra Settings'
    },
    {
      title: 'Call of Duty: Modern Warfare',
      image: 'https://picsum.photos/id/232/600/400',
      fps: '144+',
      specs: 'RTX 4060 | High Settings'
    },
    {
      title: 'Fortnite',
      image: 'https://picsum.photos/id/233/600/400',
      fps: '240+',
      specs: 'RTX 4080 | Competitive Settings'
    },
    {
      title: 'League of Legends',
      image: 'https://picsum.photos/id/234/600/400',
      fps: '360+',
      specs: 'RTX 3060 | Max Settings'
    },
    {
      title: 'GTA V',
      image: 'https://picsum.photos/id/235/600/400',
      fps: '100+',
      specs: 'RTX 3070 | Very High Settings'
    },
    {
      title: 'Valorant',
      image: 'https://picsum.photos/id/236/600/400',
      fps: '400+',
      specs: 'GTX 1660 | Max Settings'
    }
  ];

  influencers = [
    { name: 'GamerMX', image: 'https://picsum.photos/id/237/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'TechGirl', image: 'https://picsum.photos/id/238/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'ProPlayer', image: 'https://picsum.photos/id/239/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'StreamQueen', image: 'https://picsum.photos/id/240/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'PCMaster', image: 'https://picsum.photos/id/241/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'GameDev', image: 'https://picsum.photos/id/242/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'ContentCreator', image: 'https://picsum.photos/id/243/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'RTXPower', image: 'https://picsum.photos/id/244/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } },
    { name: 'CPUOverclock', image: 'https://picsum.photos/id/245/300/300', social: { twitch: 'https://twitch.tv', instagram: 'https://instagram.com' } }
  ];

  pcNeeds = [
    { 
      id: 'streaming',
      title: 'Streaming Profesional', 
      description: 'PC para transmisiones en vivo de alta calidad.', 
      bgImage: 'https://picsum.photos/id/201/500/500'
    },
    { 
      id: 'gaming',
      title: 'Gaming Competitivo', 
      description: 'Máximo rendimiento para e-sports y torneos.', 
      bgImage: 'https://picsum.photos/id/202/500/500'
    },
    { 
      id: 'content',
      title: 'Creación de Contenido', 
      description: 'Edición de video y renderizado optimizado.', 
      bgImage: 'https://picsum.photos/id/203/500/500'
    },
    { 
      id: 'design',
      title: 'Diseño 3D', 
      description: 'Modelado y renderizado profesional.', 
      bgImage: 'https://picsum.photos/id/204/500/500'
    },
    { 
      id: 'ai',
      title: 'Inteligencia Artificial', 
      description: 'Entrenamiento de modelos y deep learning.', 
      bgImage: 'https://picsum.photos/id/205/500/500'
    }
  ];

  brands = [
    { name: 'NVIDIA', logo: 'assets/img/marcas/nvidia.png' },
    { name: 'AMD', logo: 'assets/img/marcas/amd.png' },
    { name: 'Intel', logo: 'assets/img/marcas/intel.png' },
    { name: 'ASUS', logo: 'assets/img/marcas/asus.png' },
    { name: 'MSI', logo: 'assets/img/marcas/msi.png' },
    { name: 'Corsair', logo: 'assets/img/marcas/corsair.png' },
    { name: 'Gigabyte', logo: 'assets/img/marcas/gigabyte.png' },
    { name: 'HyperX', logo: 'assets/img/marcas/hyperx.png' }
  ];

  services = [
    {
      title: 'Mantenimiento',
      description: 'Limpieza profesional de hardware y optimización de software.',
      icon: 'fas fa-tools'
    },
    {
      title: 'Actualización',
      description: 'Mejora componentes para aumentar rendimiento y compatibilidad.',
      icon: 'fas fa-microchip'
    },
    {
      title: 'Reparación',
      description: 'Diagnóstico y solución de problemas hardware y software.',
      icon: 'fas fa-wrench'
    },
    {
      title: 'Ensamble',
      description: 'Construcción de PC a medida con los mejores componentes.',
      icon: 'fas fa-desktop'
    }
  ];

  latestPosts = [
    {
      title: 'Las mejores tarjetas gráficas para 2024',
      excerpt: 'Analizamos las mejores opciones de Nvidia y AMD para cada presupuesto.',
      image: 'https://picsum.photos/id/211/600/400',
      date: new Date('2023-12-15'),
      slug: 'mejores-tarjetas-graficas-2024'
    },
    {
      title: 'Guía para overclock seguro de CPU',
      excerpt: 'Todo lo que necesitas saber para aumentar el rendimiento de tu procesador sin riesgos.',
      image: 'https://picsum.photos/id/212/600/400',
      date: new Date('2023-12-10'),
      slug: 'guia-overclock-seguro-cpu'
    },
    {
      title: 'Cómo configurar tu PC para streaming',
      excerpt: 'Ajustes de OBS, hardware recomendado y consejos de profesionales.',
      image: 'https://picsum.photos/id/213/600/400',
      date: new Date('2023-12-05'),
      slug: 'configurar-pc-para-streaming'
    }
  ];

  // Variable para almacenar referencia al intervalo
  private _intervalId: any;

  // Productos para el carrusel de ensambles
  carruselProducts = [
    {
      id: 1,
      title: "CPU PRE ARMADO 1",
      image: "assets/img/gabinetes/BR-938686_1.png",
      price: 11999,
      processor: "AMD RYZEN 7 5700",
      motherboard: "ASUS ROG STRIX B550-F",
      ram: "16 GB DDR4",
      storage: "SSD M.2 NVME 1TB",
      graphicsCard: "NVIDIA RTX 3060",
      slug: "cpu-pre-armado-1",
      // Aseguramos que las propiedades existan incluso si están vacías
      brandLogos: [
        { src: "assets/img/marcas/nvidia_tag.svg", alt: "NVIDIA", position: "top-left" },
        { src: "assets/img/marcas/ryzen_tag.svg", alt: "AMD Ryzen", position: "top-right" },
        { src: "assets/img/marcas/corsairbrand.png", alt: "Corsair", position: "bottom-left" },
      ],
      powerCertificate: "assets/img/certificaciones/80plusgold.png",
      watts: 650
    },
    {
      id: 2,
      title: "CPU PRE ARMADO 2",
      image: "assets/img/gabinetes/HBJNKHGNM.png",
      price: 15999,
      processor: "INTEL CORE i5-12400F",
      motherboard: "ASUS PRIME B660M-A",
      ram: "32 GB DDR4",
      storage: "SSD M.2 NVME 1TB",
      graphicsCard: "NVIDIA RTX 3070",
      slug: "cpu-pre-armado-2",
      brandLogos: [
        { src: "assets/img/marcas/nvidia_tag.svg", alt: "NVIDIA", position: "top-left" },
        { src: "assets/img/marcas/ryzen_tag.svg", alt: "AMD Ryzen", position: "top-right" },
        { src: "assets/img/marcas/corsairbrand.png", alt: "Corsair", position: "bottom-left" },
      ],
      powerCertificate: "assets/img/certificaciones/80plusgold.png",
      watts: 650
    },
    {
      id: 3,
      title: "CPU PRE ARMADO 3",
      image: "assets/img/gabinetes/product-section-01.png",
      price: 21999,
      processor: "AMD RYZEN 9 5900X",
      motherboard: "ASUS ROG STRIX X570-E",
      ram: "32 GB DDR4",
      storage: "SSD M.2 NVME 2TB",
      graphicsCard: "NVIDIA RTX 3080",
      slug: "cpu-pre-armado-3",
      brandLogos: [
        { src: "assets/img/marcas/nvidia_tag.svg", alt: "NVIDIA", position: "top-left" },
        { src: "assets/img/marcas/ryzen_tag.svg", alt: "AMD Ryzen", position: "top-right" },
        { src: "assets/img/marcas/corsairbrand.png", alt: "Corsair", position: "bottom-left" },                                                 
      ],
      powerCertificate: "assets/img/certificaciones/80plusgold.png",
      watts: 650
    },
    {
      id: 4,
      title: "CPU PRE ARMADO 4",
      image: "assets/img/gabinetes/rog-hyperion-gr701.png",
      price: 29999,
      processor: "INTEL CORE i9-12900K",
      motherboard: "ASUS ROG MAXIMUS Z690 HERO",
      ram: "64 GB DDR5",
      storage: "SSD M.2 NVME 2TB",
      graphicsCard: "NVIDIA RTX 4080",
      slug: "cpu-pre-armado-4",
      brandLogos: [
        { src: "assets/img/marcas/nvidia_tag.svg", alt: "NVIDIA", position: "top-left" },
        { src: "assets/img/marcas/ryzen_tag.svg", alt: "AMD Ryzen", position: "top-right" },
        { src: "assets/img/marcas/corsairbrand.png", alt: "Corsair", position: "bottom-left" },
      ],
      powerCertificate: "assets/img/certificaciones/80plusgold.png",
      watts: 650
    },
    {
      id: 5,
      title: "CPU PRE ARMADO 5",
      image: "assets/img/gabinetes/rog-hyperion-gr701.png",
      price: 34999,
      processor: "AMD RYZEN 9 5950X",
      motherboard: "ASUS ROG CROSSHAIR VIII HERO",
      ram: "64 GB DDR4",
      storage: "SSD M.2 NVME 2TB",
      graphicsCard: "NVIDIA RTX 4090",
      slug: "cpu-pre-armado-5",
      brandLogos: [
        { src: "assets/img/marcas/nvidia_tag.svg", alt: "NVIDIA", position: "top-left" },
        { src: "assets/img/marcas/ryzen_tag.svg", alt: "AMD Ryzen", position: "top-right" },
        { src: "assets/img/marcas/corsairbrand.png", alt: "Corsair", position: "bottom-left" },
      ],
      powerCertificate: "assets/img/certificaciones/80plusgold.png",
      watts: 650
    }
  ];

  @ViewChildren('productCard') productCards!: QueryList<ElementRef>;
  
  // Variables para el slider de productos mejorado
  cardWidth: number = 0;
  cardsPerView: number = 1;
  totalPages: number = 0;
  maxVisibleIndex: number = 0;
  containerWidth: number = 0;

  // Método para navegar entre productos
  nextProduct() {
    if (this.currentProductIndex < this.maxVisibleIndex) {
      this.currentProductIndex++;
    }
  }
  
  prevProduct() {
    if (this.currentProductIndex > 0) {
      this.currentProductIndex--;
    }
  }

  // Para el efecto typing - usando un enfoque con Observable para mejor fiabilidad
  typingText = '';
  fullText = 'El futuro es hoy, oiste viejo\nBienvenido a Pc Gamer CDMX';
  private typingSubscription?: Subscription;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Encapsulamos las operaciones del navegador para evitar problemas con SSR
    if (typeof window !== 'undefined') {
      console.log('Home component initialized');
      
      // Usar un setTimeout para asegurar que la vista está lista
      setTimeout(() => {
        console.log('Starting typing effect');
        this.startTypingWithObservable();
      }, 500);
      
      // Añade la rotación de imágenes del slider y PC
      this._intervalId = setInterval(() => {
        this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
        this.pcIndex = (this.pcIndex + 1) % this.pcBuilds.length;
      }, 4000);
    }
  }

  ngAfterViewInit() {
    // Calcular dimensiones después de que la vista se ha inicializado
    setTimeout(() => {
      this.calculateSliderDimensions();
    }, 100);
  }

  calculateSliderDimensions() {
    if (this.productCards && this.productCards.length > 0) {
      try {
        // Obtener el ancho de una tarjeta incluyendo margen
        const card = this.productCards.first.nativeElement;
        this.cardWidth = card.offsetWidth + 32; // 32px es el valor del gap (gap-8 = 2rem = 32px)
        
        // Obtener el ancho del contenedor
        const container = card.parentElement.parentElement;
        this.containerWidth = container.offsetWidth;
        
        // Calcular cuántas tarjetas caben en la vista
        this.cardsPerView = Math.max(1, Math.floor(this.containerWidth / this.cardWidth));
        
        // Calcular el índice máximo al que se puede desplazar
        this.maxVisibleIndex = this.carruselProducts.length - this.cardsPerView;
        
        // Asegurarse de que el currentProductIndex no exceda el máximo
        if (this.currentProductIndex > this.maxVisibleIndex) {
          this.currentProductIndex = this.maxVisibleIndex;
        }
      } catch (error) {
        console.error('Error calculating slider dimensions:', error);
      }
    }
  }
  
  getSlideTransform(): number {
    // Si el cálculo aún no se ha realizado, devuelve 0
    if (this.cardWidth === 0) return 0;
    
    // Calcular la posición de desplazamiento basada en el ancho de la tarjeta
    return this.currentProductIndex * this.cardWidth * -1;
  }

  // Método para detectar si estamos en un dispositivo móvil
  isMobile(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // 768px es el breakpoint md en Tailwind
    }
    return false;
  }

  @HostListener('window:resize')
  onResize() {
    // Recalcular en cambios de tamaño de pantalla
    this.calculateSliderDimensions();
  }

  startTypingWithObservable(): void {
    console.log('Initial text:', this.typingText);
    // Reiniciar texto
    this.typingText = '';
    
    // Cancelar suscripción anterior si existe
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    
    // Crear Observable que emitirá cada carácter con un delay inicial
    this.typingSubscription = interval(this.typingSpeed)
      .pipe(
        take(this.fullText.length),
        tap(index => {
          this.ngZone.run(() => {
            this.typingText += this.fullText.charAt(index);
            console.log('Current text:', this.typingText);
            // Forzar detección de cambios explícitamente
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        complete: () => console.log('Typing effect completed')
      });
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones y timers
    if (this.typingSubscription) {
      this.typingSubscription.unsubscribe();
    }
    
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }

  // Velocidad de escritura en milisegundos
  private typingSpeed = 40;

  // Método para manejar errores de carga de imágenes
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/img/placeholder.png'; // Ruta a una imagen predeterminada
      img.onerror = null; // Evita bucles infinitos
    }
  }

  // Datos para la sección Custom Case
  customCases = [
    {
      id: "case001",
      title: "CyberShadow V3",
      imageUrl: "assets/img/custom/IMG-20250208-WA0075.jpg",
      description: "Gabinete con panel de vidrio templado, refrigeración líquida y luces RGB direccionables.",
      tags: ["RGB", "Vidrio", "Refrigeración Líquida"]
    },
    {
      id: "case002",
      title: "Neon Pulse",
      imageUrl: "assets/img/custom/IMG-20250208-WA0059.jpg",
      description: "Compacto pero potente, con sistema de iluminación personalizado y cable management optimizado.",
      tags: ["Compacto", "RGB", "Silencioso"]
    },
    {
      id: "case003",
      title: "Arctic Frost",
      imageUrl: "assets/img/custom/IMG-20250208-WA0066.jpg",
      description: "Diseño blanco minimalista con acentos LED azules y excelente flujo de aire.",
      tags: ["Blanco", "Airflow", "Minimalista"]
    },
    {
      id: "case004",
      title: "Dragon Fire",
      imageUrl: "assets/img/custom/IMG-20250208-WA0071.jpg",
      description: "Gabinete gaming agresivo con panel lateral de vidrio templado y soporte para múltiples radiadores.",
      tags: ["Gaming", "RGB", "ATX"]
    },
    {
      id: "case005",
      title: "Phantom Stealth",
      imageUrl: "assets/img/custom/IMG-20250208-WA0072.jpg",
      description: "Diseño negro mate con detalles sutiles y configuración silenciosa.",
      tags: ["Silencioso", "Negro", "Minimalista"]
    },
    {
      id: "case006",
      title: "Quantum Flux",
      imageUrl: "assets/img/custom/IMG-20250208-WA0056.jpg",
      description: "Gabinete premium con iluminación RGB integrada y soporte para hardware de alta gama.",
      tags: ["Premium", "E-ATX", "RGB"]
    },
    {
      id: "case007",
      title: "Vortex Core",
      imageUrl: "assets/img/custom/IMG-20250208-WA0078.jpg",
      description: "Diseño compacto optimizado para máximo rendimiento térmico.",
      tags: ["Compacto", "Airflow", "Mini-ITX"]
    }
  ];

  // Variable para almacenar el case seleccionado para el modal
  selectedCustomCase: any = null;

  // Método para abrir el modal de custom case
  openCustomCaseModal(customCase: any): void {
    this.selectedCustomCase = customCase;
    // Aquí implementarías la lógica para mostrar el modal
    // Por ahora solo mostramos en consola
    console.log('Abriendo modal para:', customCase.title);
  }
}

