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
    <section class="py-16 relative bg-[#090b20] relative overflow-hidden">
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500 to-transparent">
      </div>
      <!-- <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div> -->
      <div class="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent">
      </div>
      <div class="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-sky-400 to-transparent">
      </div>
    </div>
      <!-- Efecto de fondo cyberpunk -->
      <div class="absolute inset-0 bg-gradient-to-r from-[#090b20] via-[#1a1c3d] to-[#090b20] opacity-50"></div>
      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CiAgPHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPgogIDxwYXRoIGQgPSJNMzAgMzBMNjAgNjBIMHoiIGZpbGw9IiMxYTFjM2QiIG9wYWNpdHk9IjAuMSIvPgo8L3N2Zz4=')] opacity-10"></div>

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
          <div class="flex transition-transform duration-[3000ms] ease-linear"
               [style.transform]="'translateX(' + -currentTranslation + '%)'">
            <div class="flex justify-center items-center gap-8 animate-slide">
              <div *ngFor="let brand of brands"
                   class="w-32 h-32 flex-none flex items-center justify-center p-4 
                          bg-gradient-to-br from-[#161a3c]/80 to-[#1e2350]/80
                          rounded-lg backdrop-blur-sm border border-sky-500/10
                          hover:border-sky-400/30 hover:from-[#1e2350]/90 hover:to-[#2a2f6d]/90
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
      animation: slide 30s linear infinite;
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