import { Component, Input, OnInit, AfterViewInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Category {
  name: string;
  value: string;
}

@Component({
  selector: 'app-peripherals-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './peripherals-slider.component.html',
  styleUrls: ['./peripherals-slider.component.css']
})
export class PeripheralsSliderComponent implements OnInit, AfterViewInit {
  @Input() items: any[] = [];
  @Input() categories: Category[] = [];
  @Input() showFilters: boolean = true;
  @Input() showArrows: boolean = true;
  @Input() showMobileIndicator: boolean = true;
  
  @ViewChild('sliderContainer') sliderContainer!: ElementRef;
  
  selectedCategoryIndex: number = 0;
  scrollPosition: number = 0;
  scrollStep: number = 300;
  
  get filteredItems() {
    const selectedCategory = this.categories[this.selectedCategoryIndex].value;
    return selectedCategory === 'all' 
      ? this.items 
      : this.items.filter(item => item.category === selectedCategory);
  }
  
  ngOnInit(): void {
    // Inicialización si es necesaria
  }
  
  ngAfterViewInit(): void {
    // Cálculos iniciales después de que la vista se ha inicializado
    setTimeout(() => this.calculateDimensions(), 100);
  }
  
  calculateDimensions(): void {
    // Cálculos para dimensiones del slider si son necesarios
  }
  
  selectCategory(index: number): void {
    this.selectedCategoryIndex = index;
    this.scrollPosition = 0; // Reset scroll position when category changes
  }
  
  scrollLeft(): void {
    const scrollStep = this.scrollStep * 2;
    this.scrollPosition = Math.max(0, this.scrollPosition - scrollStep);
  }
  
  scrollRight(): void {
    const maxScroll = this.getMaxScroll();
    
    if (this.scrollPosition + this.scrollStep * 2 >= maxScroll * 0.8) {
      this.scrollPosition = maxScroll;
    } else {
      const scrollStep = this.scrollStep * 2;
      this.scrollPosition = Math.min(maxScroll, this.scrollPosition + scrollStep);
    }
  }
  
  getMaxScroll(): number {
    if (!this.sliderContainer || !this.sliderContainer.nativeElement) return 0;
    
    const slider = this.sliderContainer.nativeElement;
    const container = slider.parentElement;
    
    // Ancho total del contenido del slider - ancho visible del contenedor
    return Math.max(0, slider.scrollWidth - container.clientWidth);
  }
  
  isMobile(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768; // 768px es el breakpoint md en Tailwind
    }
    return false;
  }
  
  @HostListener('window:resize')
  onResize(): void {
    this.calculateDimensions();
  }
  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://picsum.photos/id/204/400/400';
      img.onerror = null;
    }
  }
}
