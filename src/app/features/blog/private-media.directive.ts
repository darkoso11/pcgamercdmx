import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Inject, Injector, Input, OnChanges, OnDestroy, PLATFORM_ID, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';

/** Admin previews use short-lived blob URLs; credentials never enter image URLs. */
@Directive({ selector: '[privateMedia]', standalone: true })
export class PrivateMediaDirective implements OnChanges, OnDestroy {
  @Input() privateMedia: string | undefined;
  @Input() authorizedMedia = false;
  private request?: Subscription;
  private blobUrl?: string;

  constructor(private element: ElementRef<HTMLMediaElement | HTMLImageElement>, private renderer: Renderer2,
    private injector: Injector, @Inject(PLATFORM_ID) private platformId: object) {}

  ngOnChanges(): void {
    this.release();
    this.renderer.removeAttribute(this.element.nativeElement, 'src');
    const url = this.privateMedia;
    if (!url || !/^(https?:|blob:|data:image\/)/i.test(url)) return;
    if (this.authorizedMedia && isPlatformBrowser(this.platformId)) {
      const api = this.injector.get(DirectusApiService);
      if (api.isAssetUrl(url)) {
        this.request = api.readAsset(url).subscribe({
          next: blob => {
            this.blobUrl = URL.createObjectURL(blob);
            this.renderer.setAttribute(this.element.nativeElement, 'src', this.blobUrl);
          },
          error: () => this.renderer.removeAttribute(this.element.nativeElement, 'src'),
        });
        return;
      }
    }
    this.renderer.setAttribute(this.element.nativeElement, 'src', url);
  }

  ngOnDestroy(): void { this.release(); }

  private release(): void {
    this.request?.unsubscribe();
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    this.blobUrl = undefined;
  }
}
