import {
  Component,
  Input,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
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
export class ProductsSliderComponent implements AfterViewInit, OnChanges {
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

  // Reset carousel when products are filtered or products array changes
  ngOnChanges(changes: SimpleChanges) {
    let shouldReset = false;
    
    // Reset when products array changes
    if (changes['products'] && !changes['products'].firstChange) {
      shouldReset = true;
    }
    
    // Reset when wasFiltered changes
    if (changes['wasFiltered']) {
      const currentValue = changes['wasFiltered'].currentValue;
      
      if (currentValue) {
        shouldReset = true;
        this.filterChange.emit(true);
      } else if (changes['wasFiltered'].previousValue && !currentValue) {
        shouldReset = true;
      }
    }
    
    if (shouldReset) {
      this.resetCarousel();
    }
  }

  // Method to reset carousel to initial state
  private resetCarousel() {
    this.currentIndex = 0;
    this.cardWidth = 0;
    this.cardsPerView = 1;
    this.maxVisibleIndex = 0;
    this.containerWidth = 0;
    
    // Single timeout for dimension calculation
    setTimeout(() => {
      this.calculateSliderDimensions();
    }, 100);
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateSliderDimensions();
    }, 100);
  }

  calculateSliderDimensions() {
    if (this.productCards && this.productCards.length > 0 && this.products.length > 0) {
      try {
        const card = this.productCards.first.nativeElement;
        
        // Skip calculation if card is not ready
        if (card.offsetWidth === 0) {
          return;
        }
        
        this.cardWidth = card.offsetWidth + 32; // 32px gap
        const container = card.parentElement.parentElement;
        this.containerWidth = container.offsetWidth;

        this.cardsPerView = Math.max(
          1,
          Math.floor(this.containerWidth / this.cardWidth)
        );

        this.maxVisibleIndex = Math.max(0, this.products.length - this.cardsPerView);
        this.currentIndex = Math.max(0, Math.min(this.currentIndex, this.maxVisibleIndex));
        
      } catch (error) {
        // Reset to safe defaults in case of error
        this.currentIndex = 0;
        this.maxVisibleIndex = 0;
        this.cardsPerView = 1;
      }
    } else {
      // No products available, reset to safe defaults
      this.currentIndex = 0;
      this.maxVisibleIndex = 0;
      this.cardsPerView = 1;
    }
  }

  nextProduct() {
    if (this.currentIndex < this.maxVisibleIndex && this.products.length > this.cardsPerView) {
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
    if (this.cardWidth === 0 || this.products.length === 0) return 0;

    const safeIndex = Math.max(0, Math.min(this.currentIndex, this.maxVisibleIndex));
    return safeIndex * this.cardWidth * -1;
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
    this.cardWidth = 0;
    this.containerWidth = 0;
    setTimeout(() => {
      this.calculateSliderDimensions();
    }, 200);
  }

  // Helper methods for better UX
  canNavigatePrev(): boolean {
    return this.currentIndex > 0 && this.products.length > this.cardsPerView;
  }

  canNavigateNext(): boolean {
    return this.currentIndex < this.maxVisibleIndex && this.products.length > this.cardsPerView;
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
