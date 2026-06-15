import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface HomeServiceItem {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-home-services-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="py-16 bg-gradient-to-br relative from-[#0f172a] via-[#1e293b] to-[#0ea5e9]">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent"></div>
        <div class="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-pink-500 to-transparent"></div>
        <div class="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-red-500 to-transparent"></div>
      </div>

      <h2 class="text-3xl md:text-4xl font-bold text-white text-center mb-16 relative before:content-[''] before:absolute before:h-1 before:w-12 before:bg-pink-400 before:-bottom-3 before:left-1/2 before:-translate-x-1/2">
        Servicios Tecnicos
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
        <ng-container *ngFor="let service of services">
          <div class="bg-black/30 backdrop-blur-sm border border-white/10 p-6 rounded-lg group hover:border-pink-500/50 transition-all duration-300">
            <div class="w-14 h-14 rounded-full bg-pink-500/20 flex items-center justify-center mb-4 text-pink-400 text-2xl group-hover:bg-pink-500/30 transition-all">
              <i [class]="service.icon"></i>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">{{ service.title }}</h3>
            <p class="text-gray-300 text-sm">{{ service.description }}</p>
          </div>
        </ng-container>
      </div>

      <div class="text-center mt-12">
        <a routerLink="/servicios" class="bg-white text-blue-900 py-3 px-8 rounded-lg font-bold hover:bg-pink-400 hover:text-white transition-colors">
          Ver todos los servicios
        </a>
      </div>
    </section>
  `,
})
export class HomeServicesSectionComponent {
  @Input({ required: true }) services: HomeServiceItem[] = [];
}
