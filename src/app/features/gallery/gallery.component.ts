import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { GalleryService, ImageItem, emptyGallerySettings } from './gallery.service';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  activeTag = '';
  tags: string[] = [];
  loading = true;
  error = '';
  settings = emptyGallerySettings();
  private readonly destroy$ = new Subject<void>();
  modalImage: ImageItem | null = null;
  private previouslyFocusedElement: HTMLElement | null = null;
  private previousBodyOverflow: string | null = null;
  private focusTimer?: ReturnType<typeof setTimeout>;

  constructor(private gallery: GalleryService, private route: ActivatedRoute, private viewportScroller: ViewportScroller, private seo: SeoService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.activeCategory = params['category'] || 'all';
      this.applyFilter();
    });
    this.load();
    this.viewportScroller.scrollToPosition([0, 0]);
  }

  load(): void {
    this.loading = true; this.error = '';
    forkJoin({ images: this.gallery.getImages(), settings: this.gallery.getSettings() })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: ({ images, settings }) => {
          this.images = images; this.settings = settings;
          this.categories = ['all', ...new Set(images.map(i => i.category))];
          this.tags = [...new Set(images.flatMap(i => i.tags))].sort();
          this.applyFilter(); this.loading = false;
          const social = images.find(i => i.id === settings.social_image_id) || images[0];
          this.seo.update({ title: settings.seo_title, description: settings.seo_description,
            url: '/galeria', image: social?.src, imageAlt: social?.alt, structuredData: [{ id: 'gallery-schema', data: {
              '@context': 'https://schema.org', '@type': 'ImageGallery', name: settings.heading,
              description: settings.subtitle, url: `${environment.siteUrl}/galeria`,
              image: images.map(i => ({ '@type': 'ImageObject', contentUrl: new URL(i.src, environment.siteUrl).href,
                name: i.title, caption: i.alt, description: i.description, keywords: i.tags.join(', '),
                ...(i.author ? { creator: { '@type': 'Person', name: i.author } } : {}),
                ...(i.date ? { dateCreated: i.date } : {}),
              })),
            } }] });
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false; this.error = 'No se pudo cargar la galería. Inténtalo de nuevo.';
          this.seo.update({ title: 'Galería | PC Gamer CDMX', url: '/galeria', structuredData: [] });
          this.cdr.markForCheck();
        },
      });
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilter();
  }

  applyFilter() {
    this.filtered = this.images.filter(i => (this.activeCategory === 'all' || i.category === this.activeCategory)
      && (!this.activeTag || i.tags.includes(this.activeTag)));
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
    this.destroy$.next(); this.destroy$.complete();
    this.seo.clearPageStructuredData();
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
