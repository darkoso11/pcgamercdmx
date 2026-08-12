import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { GalleryService, ImageItem } from './gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  @ViewChild('galleryDialog') private galleryDialog?: ElementRef<HTMLElement>;
  @ViewChild('modalClose') private modalClose?: ElementRef<HTMLButtonElement>;

  images: ImageItem[] = [];
  filtered: ImageItem[] = [];
  categories: string[] = [];
  activeCategory = 'all';
  modalImage: ImageItem | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;
  private previousBodyOverflow: string | null = null;
  private focusTimer?: ReturnType<typeof setTimeout>;

  constructor(private gallery: GalleryService, private route: ActivatedRoute, private viewportScroller: ViewportScroller) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.activeCategory = params['category'] || 'all';
      if (this.images.length > 0) {
        this.applyFilter();
      }
    });

    this.gallery.getImages().subscribe(data => {
      this.images = data;
      this.categories = ['all', ...Array.from(new Set(data.map(i => i.category)))];
      this.applyFilter();
    });

    // Scroll to top when component loads
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilter();
  }

  applyFilter() {
    this.filtered = this.activeCategory === 'all' ? this.images : this.images.filter(i => i.category === this.activeCategory);
  }

  open(item: ImageItem): void {
    this.previouslyFocusedElement = document.activeElement as HTMLElement | null;
    if (this.previousBodyOverflow === null) {
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    this.modalImage = item;
    this.focusTimer = setTimeout(() => this.modalClose?.nativeElement.focus());
  }

  close(): void {
    const focusTarget = this.previouslyFocusedElement;
    this.modalImage = null;
    this.previouslyFocusedElement = null;
    this.restorePageScroll();
    this.focusTimer = setTimeout(() => focusTarget?.focus());
  }

  ngOnDestroy(): void {
    if (this.focusTimer) {
      clearTimeout(this.focusTimer);
    }
    this.restorePageScroll();
  }

  @HostListener('document:keydown', ['$event'])
  handleDialogKeydown(event: KeyboardEvent): void {
    if (!this.modalImage) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'Tab') {
      this.trapDialogFocus(event);
    }
  }

  private trapDialogFocus(event: KeyboardEvent): void {
    const dialog = this.galleryDialog?.nativeElement;
    if (!dialog) {
      return;
    }

    const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    ));
    if (!controls.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private restorePageScroll(): void {
    if (this.previousBodyOverflow === null) {
      return;
    }

    document.body.style.overflow = this.previousBodyOverflow;
    this.previousBodyOverflow = null;
  }

  trackBySrc(_index: number, item: ImageItem): string {
    return item.src;
  }
}
