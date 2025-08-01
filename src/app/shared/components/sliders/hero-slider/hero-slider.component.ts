import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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
export class HeroSliderComponent implements OnInit, OnDestroy {
  @Input() items: SliderItem[] = [];
  @Input() options: SliderOptions = {
    autoplay: true,
    autoplayDelay: 4000,
    showArrows: false,
    showIndicators: false
  };
  
  currentIndex = 0;
  private intervalId: any;
  
  ngOnInit(): void {
    if (this.options.autoplay) {
      this.startAutoplay();
    }
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
  }
  
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
  }
  
  goToSlide(index: number): void {
    if (index >= 0 && index < this.items.length) {
      this.currentIndex = index;
    }
  }
  
  // Método auxiliar para determinar el tipo de enlace
  isExternalLink(url: string): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }
}
