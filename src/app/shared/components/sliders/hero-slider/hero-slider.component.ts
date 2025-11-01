import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SliderItem, SliderOptions } from '../../../models/slider.model';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.css']
})
export class HeroSliderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() items: SliderItem[] = [];
  @Input() options: SliderOptions = {
    autoplay: true,
    autoplayDelay: 4000,
    showArrows: false,
    showIndicators: false
  };
  
  itemsWithLinkType: Array<{ item: SliderItem; isExternal: boolean }> = [];
  
  currentIndex = 0;
  private intervalId: any;
  
  constructor(private cdr: ChangeDetectorRef) {}
  
  ngOnInit(): void {
    this.processItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      this.processItems();
    }
    if (changes['options'] && !changes['options'].firstChange) {
      this.stopAutoplay();
      if (this.options.autoplay) {
        this.startAutoplay();
      }
    }
  }

  private processItems(): void {
    // Detener el autoplay si está activo
    this.stopAutoplay();
    
    // Reiniciar el índice
    this.currentIndex = 0;
    
    // Procesar los items
    this.itemsWithLinkType = this.items.map(item => ({
      item,
      isExternal: this.checkIfExternalLink(item.link)
    }));

    // Iniciar autoplay si está habilitado
    if (this.options.autoplay) {
      this.startAutoplay();
    }

    // Forzar la detección de cambios
    this.cdr.detectChanges();
  }

  private checkIfExternalLink(url: string | undefined): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }
  
  ngOnDestroy(): void {
    this.stopAutoplay();
  }
  
  startAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.next();
    }, this.options.autoplayDelay || 4000);
  }
  
  stopAutoplay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.cdr.detectChanges();
  }
  
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.cdr.detectChanges();
  }
  
  goToSlide(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
      this.cdr.detectChanges();
    }
  }
}
