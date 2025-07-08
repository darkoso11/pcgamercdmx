import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="w-full flex flex-col items-center py-12 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0ea5e9]">
      <h2 class="text-3xl md:text-4xl font-bold text-white mb-8">Nuestros Ensambles</h2>
      <div class="relative w-full max-w-5xl overflow-hidden">
        <div class="flex transition-transform duration-500"
             [style.transform]="'translateX(-' + (currentProductIndex * 100) + '%)'">
          <div *ngFor="let product of products" class="w-full flex-shrink-0 flex flex-col items-center px-4">
            <img [src]="product.image" [alt]="product.title" class="w-72 h-72 object-cover rounded-xl border-2 border-cyan-400 shadow-neon mb-4" />
            <h3 class="text-xl font-bold text-white mb-2">{{ product.title }}</h3>
            <p class="text-white text-sm mb-2">{{ product.processor }} | {{ product.graphicsCard }}</p>
            <p class="text-white text-xs mb-2">{{ product.ram }} | {{ product.storage }}</p>
            <span class="text-cyan-400 font-bold text-lg mb-2">$ {{ product.price | number }}</span>
            <a [routerLink]="['/productos', product.slug]" class="btn-comprar-cyber mt-2">Ver más</a>
          </div>
        </div>
        <button (click)="prevProduct()" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-cyan-500 transition z-10">
          &#8592;
        </button>
        <button (click)="nextProduct()" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white rounded-full p-2 hover:bg-cyan-500 transition z-10">
          &#8594;
        </button>
      </div>
      <div class="flex gap-2 mt-4">
        <button *ngFor="let p of products; let i = index"
                class="w-3 h-3 rounded-full"
                [ngClass]="currentProductIndex === i ? 'bg-cyan-400' : 'bg-white/30'"
                (click)="goTo(i)">
        </button>
      </div>
    </section>
  `,
  styles: [`
    @media (max-width: 900px) {
      img { width: 90vw !important; height: 40vw !important; max-width: 340px; max-height: 340px; }
    }
  `]
})
export class ProductsSliderComponent {
  @Input() products: any[] = [];
  currentProductIndex = 0;

  prevProduct() {
    this.currentProductIndex = (this.currentProductIndex - 1 + this.products.length) % this.products.length;
  }
  nextProduct() {
    this.currentProductIndex = (this.currentProductIndex + 1) % this.products.length;
  }
  goTo(i: number) {
    this.currentProductIndex = i;
  }
}
