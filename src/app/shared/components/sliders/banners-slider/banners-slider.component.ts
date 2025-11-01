import { Component, Input, OnInit, OnDestroy, ElementRef, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
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
  @Input() enableSwipe: boolean = true;
  
  currentIndex: number = 0;
  private intervalId: any;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private minSwipeDistance: number = 50;

  transform: string = 'translateX(0%)';
  
  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (!this.enableSwipe) return;
    this.touchStartX = event.touches[0].clientX;
    this.stopAutoPlay(); // Pausar autoplay durante el swipe
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.enableSwipe) return;
    this.touchEndX = event.touches[0].clientX;
  }

  @HostListener('touchend')
  onTouchEnd() {
    if (!this.enableSwipe) return;
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        this.previousSlide();
      } else {
        this.nextSlide();
      }
    }
    
    this.startAutoPlay(); // Reanudar autoplay después del swipe
  }
  
  // Métodos para navegación externa
  nextSlide(): void {
    this.next();
    if (this.autoPlay) {
      this.startAutoPlay(); // Reinicia el autoplay después de una navegación manual
    }
  }

  previousSlide(): void {
    this.prev();
    if (this.autoPlay) {
      this.startAutoPlay(); // Reinicia el autoplay después de una navegación manual
    }
  }
  
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
  
  private updateTransform(): void {
    this.ngZone.run(() => {
      this.transform = `translateX(-${this.currentIndex * 100}%)`;
      this.cdr.detectChanges();
    });
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    this.updateTransform();
  }
  
  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.updateTransform();
  }
  
  goToSlide(index: number): void {
    if (index >= 0 && index < this.banners.length) {
      this.currentIndex = index;
      this.updateTransform();
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
