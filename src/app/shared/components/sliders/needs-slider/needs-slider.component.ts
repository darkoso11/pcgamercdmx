import { Component, Input, ElementRef, QueryList, ViewChildren, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-needs-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './needs-slider.component.html',
  styleUrls: ['./needs-slider.component.css']
})
export class NeedsSliderComponent implements AfterViewInit {
  @Input() needs: any[] = [];
  @Input() showArrows: boolean = true;
  @Input() showIndicators: boolean = true;
  
  @ViewChildren('needCard') needCards!: QueryList<ElementRef>;
  
  // Variables para el slider
  currentIndex: number = 0;
  cardWidth: number = 0;
  cardsPerView: number = 1;
  maxVisibleIndex: number = 0;
  containerWidth: number = 0;
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.calculateSliderDimensions();
    }, 100);
  }
  
  calculateSliderDimensions() {
    if (this.needCards && this.needCards.length > 0) {
      try {
        // Obtener el ancho de una tarjeta incluyendo margen
        const card = this.needCards.first.nativeElement;
        this.cardWidth = card.offsetWidth + 24; // 24px es el valor del gap (gap-6 = 1.5rem = 24px)
        
        // Obtener el ancho del contenedor
        const container = card.parentElement.parentElement;
        this.containerWidth = container.offsetWidth;
        
        // Calcular cuántas tarjetas caben en la vista
        this.cardsPerView = Math.max(1, Math.floor(this.containerWidth / this.cardWidth));
        
        // Calcular el índice máximo al que se puede desplazar
        this.maxVisibleIndex = this.needs.length - this.cardsPerView;
        
        // Asegurarse de que el currentIndex no exceda el máximo
        if (this.currentIndex > this.maxVisibleIndex) {
          this.currentIndex = this.maxVisibleIndex;
        }
      } catch (error) {
        console.error('Error calculating needs slider dimensions:', error);
      }
    }
  }
  
  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
  
  nextSlide() {
    if (this.currentIndex < this.maxVisibleIndex) {
      this.currentIndex++;
    }
  }
  
  goToSlide(index: number) {
    if (index >= 0 && index <= this.maxVisibleIndex) {
      this.currentIndex = index;
    }
  }
  
  getSlideTransform(): number {
    if (this.cardWidth === 0) return 0;
    return this.currentIndex * this.cardWidth * -1;
  }
  
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
  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://picsum.photos/id/204/400/400'; // Imagen por defecto
      img.onerror = null; // Evita bucles infinitos
    }
  }
}
