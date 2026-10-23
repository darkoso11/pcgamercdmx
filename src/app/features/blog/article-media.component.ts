import { PrivateMediaDirective } from './private-media.directive';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ArticleMedia, ArticleVideoEmbed } from './models/types';

@Component({
  selector: 'app-article-media',
  standalone: true,
  imports: [CommonModule, PrivateMediaDirective],
  template: `
    <figure *ngIf="media.kind === 'image'">
      <img [privateMedia]="media.url" [authorizedMedia]="authorizedMedia" [alt]="media.alt || ''" loading="lazy" />
      <figcaption *ngIf="media.alt">{{ media.alt }}</figcaption>
    </figure>

    <figure *ngIf="media.kind === 'video-file'">
      <video controls preload="metadata" [attr.aria-label]="media.title" [privateMedia]="media.url" [authorizedMedia]="authorizedMedia">
      </video>
      <figcaption>{{ media.title }}</figcaption>
    </figure>

    <figure *ngIf="media.kind === 'video-embed'" class="video-frame">
      <iframe
        [src]="embedUrl(media)"
        [title]="media.title"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
      <figcaption>{{ media.title }}</figcaption>
    </figure>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    figure { margin: 0; }
    img, video { display: block; width: 100%; border-radius: 10px; }
    .video-frame iframe {
      display: block;
      width: 100%;
      aspect-ratio: 16 / 9;
      border: 0;
      border-radius: 10px;
    }
    figcaption { margin-top: .6rem; color: #9db1c8; font-size: .82rem; }
  `],
})
export class ArticleMediaComponent {
  @Input() authorizedMedia = false;
  @Input({ required: true }) media!: ArticleMedia;

  constructor(private readonly sanitizer: DomSanitizer) {}

  embedUrl(media: ArticleVideoEmbed): SafeResourceUrl {
    const url = media.provider === 'youtube'
      ? `https://www.youtube-nocookie.com/embed/${media.externalId}`
      : `https://player.vimeo.com/video/${media.externalId}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
