import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { COMMERCIAL_CONTENT } from './commercial-content';
import { COMMERCIAL_PAGES } from './commercial-pages.config';

@Component({
  selector: 'app-commercial-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './commercial-page.component.html',
  styleUrl: './commercial-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommercialPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  readonly config = COMMERCIAL_PAGES.find(page => page.key === this.route.snapshot.data['commercialPage'])!;
  readonly page = COMMERCIAL_CONTENT[this.config.key];
  readonly relatedPages = COMMERCIAL_PAGES.filter(page => page.key !== this.config.key);

  constructor() {
    const url = `https://pcgamercdmx.com/${this.config.path}`;
    this.seo.updatePageStructuredData([
      { id: 'commercial-collection-schema', data: {
        '@context': 'https://schema.org', '@type': 'CollectionPage',
        name: this.page.heading, description: this.config.description, url,
      } },
      { id: 'commercial-breadcrumb-schema', data: {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://pcgamercdmx.com/' },
          { '@type': 'ListItem', position: 2, name: 'Productos', item: 'https://pcgamercdmx.com/productos' },
          { '@type': 'ListItem', position: 3, name: this.page.heading, item: url },
        ],
      } },
      { id: 'commercial-faq-schema', data: {
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: this.page.faqs.map(faq => ({
          '@type': 'Question', name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      } },
      { id: 'commercial-list-schema', data: {
        '@context': 'https://schema.org', '@type': 'ItemList',
        itemListElement: this.page.cards.map((card, index) => ({
          '@type': 'ListItem', position: index + 1, name: card.name,
          url: `${url}#producto-${index + 1}`,
        })),
      } },
    ]);
  }
}
