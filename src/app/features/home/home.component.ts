import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  // Slider superior derecho con Lorem Picsum
  sliderImages = [
    { src: 'https://picsum.photos/id/11/200/100', link: '/productos/1', alt: 'Slider 1' },
    { src: 'https://picsum.photos/id/12/200/100', link: '/productos/2', alt: 'Slider 2' },
    { src: 'https://picsum.photos/id/13/200/100', link: '/productos/3', alt: 'Slider 3' }
  ];
  sliderIndex = 0;

  // Imagen de PC usando Lorem Picsum
  pcBuilds = [
    { img: 'https://picsum.photos/id/14/350/400', link: '/productos/1' },
    { img: 'https://picsum.photos/id/15/350/400', link: '/productos/2' }
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
      image: "https://picsum.photos/id/251/600/400",
      price: 11999,
      processor: "AMD RYZEN 7 5700",
      ram: "16 GB DDR4",
      storage: "SSD M.2 NVME 1TB",
      graphicsCard: "NVIDIA RTX 3060",
      slug: "cpu-pre-armado-1"
    },
    {
      id: 2,
      title: "CPU PRE ARMADO 2",
      image: "https://picsum.photos/id/252/600/400",
      price: 15999,
      processor: "INTEL CORE i5-12400F",
      ram: "32 GB DDR4",
      storage: "SSD M.2 NVME 1TB",
      graphicsCard: "NVIDIA RTX 3070",
      slug: "cpu-pre-armado-2"
    },
    {
      id: 3,
      title: "CPU PRE ARMADO 3",
      image: "https://picsum.photos/id/253/600/400",
      price: 21999,
      processor: "AMD RYZEN 9 5900X",
      ram: "32 GB DDR4",
      storage: "SSD M.2 NVME 2TB",
      graphicsCard: "NVIDIA RTX 3080",
      slug: "cpu-pre-armado-3"
    },
    {
      id: 4,
      title: "CPU PRE ARMADO 4",
      image: "https://picsum.photos/id/254/600/400",
      price: 29999,
      processor: "INTEL CORE i9-12900K",
      ram: "64 GB DDR5",
      storage: "SSD M.2 NVME 2TB",
      graphicsCard: "NVIDIA RTX 4080",
      slug: "cpu-pre-armado-4"
    }
  ];

  // Método para navegar entre productos
  nextProduct() {
    if (this.currentProductIndex < this.carruselProducts.length - 1) {
      this.currentProductIndex++;
    } else {
      this.currentProductIndex = 0;
    }
  }
  
  prevProduct() {
    if (this.currentProductIndex > 0) {
      this.currentProductIndex--;
    } else {
      this.currentProductIndex = this.carruselProducts.length - 1;
    }
  }

  // Para el efecto typing - usando un enfoque con Observable para mejor fiabilidad
  typingText = '';
  fullText = 'El futuro es hoy, oiste viejo\nBienvenido a Pc Gamer CDMX';
  private typingSubscription?: Subscription;

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
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
}

