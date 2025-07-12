import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  typingText = '';
  fullText = 'El futuro es hoy, oiste viejo\nBienvenido a Pc Gamer CDMX';
  typingIndex = 0;
  typingSpeed = 40;

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

  ngOnInit(): void {
    this.typeText();
    // Añade la rotación de imágenes del slider y PC
    this._intervalId = setInterval(() => {
      this.sliderIndex = (this.sliderIndex + 1) % this.sliderImages.length;
      this.pcIndex = (this.pcIndex + 1) % this.pcBuilds.length;
    }, 4000);
  }

  // Función para escribir texto con efecto typing
  typeText(): void {
    if (this.typingIndex < this.fullText.length) {
      this.typingText += this.fullText[this.typingIndex++];
      setTimeout(() => this.typeText(), this.typingSpeed);
    }
  }
  
  // Implementación requerida de ngOnDestroy
  ngOnDestroy(): void {
    // Limpiar el intervalo cuando el componente se destruye para prevenir memory leaks
    if (this._intervalId) {
      clearInterval(this._intervalId);
    }
  }
}
