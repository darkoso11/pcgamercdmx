import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Brand {
  name: string;
  logo: string;
}

@Component({
  selector: 'app-brands-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-16 bg-[#090b20] relative overflow-hidden">
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent"></div>
      <!-- Efecto de fondo cyberpunk -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#0a0f1f] via-[#162032] to-[#0a0f1f] opacity-70"></div>
      <div class="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-purple-900/10 to-cyan-900/10 opacity-30"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.15),transparent_35%)] opacity-40"></div>

      <!-- Título con efecto glitch -->
        <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-16 relative glitch-text"
          data-text="Marcas Premium">
        Marcas Premium
        <div class="absolute h-1 w-12 bg-sky-500 -bottom-3 left-1/2 -translate-x-1/2
                    before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full
                    before:bg-indigo-400 before:transform before:translate-x-[2px] before:opacity-70
                    after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full
                    after:bg-sky-400 after:transform after:-translate-x-[2px] after:opacity-70">
        </div>
      </h2>

      <!-- Carrusel de marcas -->
      <div class="relative max-w-7xl mx-auto px-4">
        <div class="overflow-hidden relative">
          <div class="flex transition-all duration-[3000ms] ease-linear infinite-scroll"
               style="animation: scroll 45s linear infinite;">
            <div class="flex justify-center items-center gap-8 animate-slide">
              <div *ngFor="let brand of brands"
                   class="w-32 h-32 flex-none flex items-center justify-center p-4 
                          bg-gradient-to-br from-[#161a3c]/80 to-[#1e2350]/80
                          rounded-lg backdrop-blur-sm border border-cyan-500/10
                          hover:border-cyan-400/30 hover:from-[#1e2350]/90 hover:to-[#2a2f6d]/90
                          transition-all duration-300 cursor-pointer group">
                <img [src]="brand.logo"
                     [alt]="brand.name"
                     class="max-h-full max-w-full transition-all duration-300 
                            group-hover:scale-110 group-hover:filter group-hover:brightness-110"
                     (error)="handleImageError($event)" />
              </div>
              <!-- Duplicar las marcas para el efecto infinito -->
              <div *ngFor="let brand of brands"
                   class="w-32 h-32 flex-none flex items-center justify-center p-4 
                          bg-gradient-to-br from-[#1a2942]/80 to-[#2a3e5d]/90
                          rounded-lg backdrop-blur-md border border-cyan-500/30
                          hover:border-cyan-400/70 hover:shadow-lg hover:shadow-cyan-500/20
                          hover:from-[#1e2b45]/90 hover:to-[#2d3f61]/90
                          transition-all duration-300 cursor-pointer group">
                <img [src]="brand.logo"
                     [alt]="brand.name"
                     class="max-h-full max-w-full transition-all duration-300 
                            group-hover:scale-110 group-hover:filter group-hover:brightness-110"
                     (error)="handleImageError($event)" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes slide {
      0% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    .animate-slide {
      animation: slide 45s linear infinite;
    }
    .glitch-text {
      position: relative;
      text-shadow: 
        0.05em 0 0 rgba(255, 0, 0, 0.75),
        -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
        0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
      animation: glitch 500ms infinite;
    }
    @keyframes glitch {
      0% {
        text-shadow: 
          0.05em 0 0 rgba(255, 0, 0, 0.75),
          -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
          0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
      }
      14% {
        text-shadow: 
          0.05em 0 0 rgba(255, 0, 0, 0.75),
          -0.025em -0.05em 0 rgba(0, 255, 0, 0.75),
          0.025em 0.05em 0 rgba(0, 0, 255, 0.75);
      }
      15% {
        text-shadow: 
          -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
          0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
          -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
      }
      49% {
        text-shadow: 
          -0.05em -0.025em 0 rgba(255, 0, 0, 0.75),
          0.025em 0.025em 0 rgba(0, 255, 0, 0.75),
          -0.05em -0.05em 0 rgba(0, 0, 255, 0.75);
      }
      50% {
        text-shadow: 
          0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
          0.05em 0 0 rgba(0, 255, 0, 0.75),
          0 -0.05em 0 rgba(0, 0, 255, 0.75);
      }
      99% {
        text-shadow: 
          0.025em 0.05em 0 rgba(255, 0, 0, 0.75),
          0.05em 0 0 rgba(0, 255, 0, 0.75),
          0 -0.05em 0 rgba(0, 0, 255, 0.75);
      }
      100% {
        text-shadow: 
          -0.025em 0 0 rgba(255, 0, 0, 0.75),
          -0.025em -0.025em 0 rgba(0, 255, 0, 0.75),
          -0.025em -0.05em 0 rgba(0, 0, 255, 0.75);
      }
    }
  `]
})
export class BrandsSectionComponent implements OnInit {
  brands: Brand[] = [
    { name: 'NVIDIA', logo: 'assets/img/marcas/nvidia_tag.svg' },
    { name: 'AMD', logo: 'assets/img/marcas/AMD-Ryzen.png' },
    { name: 'Intel', logo: 'assets/img/marcas/Intel-qe15un7mdheilkp4kk4kc0rkl23pw8q1hb0dtjivj2.png' },
    { name: 'ASUS', logo: 'assets/img/marcas/asuspng.png' },
    { name: 'MSI', logo: 'assets/img/marcas/MSI-qe15ugmr1n5icayomza6ckfcfd05eczx4efzglsmlc.png' },
    { name: 'Corsair', logo: 'assets/img/marcas/corsairbrand.png' },
    { name: 'Gigabyte', logo: 'assets/img/marcas/gigabyte.png' },
    { name: 'HyperX', logo: 'assets/img/marcas/hyperx.png' },
    { name: 'Logitech', logo: 'assets/img/marcas/Logitech.png' },
    { name: 'Noctua', logo: 'assets/img/marcas/Noctua.png' },
    { name: 'EVGA', logo: 'assets/img/marcas/EVGA.png' },
    { name: 'InWin', logo: 'assets/img/marcas/inwin.png' },
    { name: 'Kingston', logo: 'assets/img/marcas/kingston.png' },
    { name: 'ASRock', logo: 'assets/img/marcas/Asrock.png' },
    { name: 'Thermaltake', logo: 'assets/img/marcas/thermaltake.png' },
    { name: 'Redragon', logo: 'assets/img/marcas/Redragon.png' },
    { name: 'Aerocool', logo: 'assets/img/marcas/aerocool.png' },
  ];

  // Estado del carrusel
  currentTranslation = 0;

  constructor() {}

  ngOnInit(): void {}

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      console.warn(`Failed to load image: ${img.src}`);
      img.src = 'https://picsum.photos/id/204/400/400';
      img.onerror = null;
    }
  }
}