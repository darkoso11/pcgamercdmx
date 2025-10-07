import {
  Component,
  Input,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  HostListener,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products-slider.component.html',
  styleUrls: ['./products-slider.component.css'],
})
export class ProductsSliderComponent implements AfterViewInit {
  @Input() products: any[] = [];
  @Input() showArrows: boolean = true;
  @Input() showMobileIndicator: boolean = true;
  @Input() wasFiltered: boolean = false;
  @Output() filterChange = new EventEmitter<any>();

  @ViewChildren('productCard') productCards!: QueryList<ElementRef>;

  // Variables para el slider
  currentIndex: number = 0;
  cardWidth: number = 0;
  cardsPerView: number = 1;
  maxVisibleIndex: number = 0;
  containerWidth: number = 0;

  // Add something that change the current index to 0 when was filtered becomes true
  ngOnChanges() {
    if (this.wasFiltered) {
      this.currentIndex = 0;
      setTimeout(() => {
        this.calculateSliderDimensions();
      }, 100);
      console.log(
        'Products were filtered, resetting currentIndex to ',
        this.currentIndex
      );
      this.filterChange.emit(true);
    }
  }

  ngAfterViewInit() {
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
        this.cardsPerView = Math.max(
          1,
          Math.floor(this.containerWidth / this.cardWidth)
        );

        // Calcular el índice máximo al que se puede desplazar
        this.maxVisibleIndex = this.products.length - this.cardsPerView;

        // Asegurarse de que el currentIndex no exceda el máximo
        if (this.currentIndex > this.maxVisibleIndex) {
          this.currentIndex = this.maxVisibleIndex;
        }
      } catch (error) {
        console.error('Error calculating slider dimensions:', error);
      }
    }
  }

  nextProduct() {
    if (this.currentIndex < this.maxVisibleIndex) {
      this.currentIndex++;
    }
  }

  prevProduct() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  goToProduct(index: number) {
    if (index >= 0 && index <= this.maxVisibleIndex) {
      this.currentIndex = index;
    }
  }

  getSlideTransform(): number {
    // Si el cálculo aún no se ha realizado, devuelve 0
    if (this.cardWidth === 0) return 0;

    // Calcular la posición de desplazamiento basada en el ancho de la tarjeta
    return this.currentIndex * this.cardWidth * -1;
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
    this.calculateSliderDimensions();
  }

  // Para manejar errores de carga de imagen
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://picsum.photos/id/204/400/400'; // Ruta a imagen predeterminada
      img.onerror = null; // Evita bucles infinitos
    }
  }
}
