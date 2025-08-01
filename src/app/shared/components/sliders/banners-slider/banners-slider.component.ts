import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-banners-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './banners-slider.component.html',
  styleUrls: ['./banners-slider.component.css']
})
export class BannersSliderComponent implements OnInit, OnDestroy {
  @Input() banners: any[] = [];
  @Input() autoPlay: boolean = true;
  @Input() autoPlayDelay: number = 5000;
  @Input() showArrows: boolean = true;
  @Input() showIndicators: boolean = true;
  
  currentIndex: number = 0;
  private intervalId: any;
  
  ngOnInit(): void {
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }
  
  startAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.next();
    }, this.autoPlayDelay);
  }
  
  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
  }
  
  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
  }
  
  goToSlide(index: number): void {
    if (index >= 0 && index < this.banners.length) {
      this.currentIndex = index;
    }
  }
  
  isExternalLink(url: string): boolean {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  }
  
  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      const bannerId = img.getAttribute('data-id') || '1';
      img.src = `https://picsum.photos/id/${240 + parseInt(bannerId)}/1200/600`;
      img.onerror = null;
    }
  }
  
  ngOnDestroy(): void {
    this.stopAutoPlay();
  }
}
