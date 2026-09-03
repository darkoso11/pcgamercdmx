import { CommonModule, isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  TransferState,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs/operators';

import { SeoService, SeoStructuredData } from '../../core/services/seo.service';
import { AssembledPC } from '../../shared/models';
import { ProductsService } from '../products/services/products.service';
import { HIGH_END_PC_SEO } from './high-end-pc.seo';

interface LandingSpec {
  label: string;
  value: string;
}

interface LandingAssemblyCard {
  title: string;
  description: string;
  image: string | null;
  imageTitle: string;
  imageAlt: string;
  price: number;
  specs: LandingSpec[];
  link: string;
  cta: string;
  source: 'catalog' | 'editorial';
  badges: string[];
}

const HIGH_END_PRODUCTS_STATE = makeStateKey<AssembledPC[]>('pc-gamer-gama-alta-products-v1');

const ASSEMBLY_IMAGE_METADATA: Record<string, { title: string; alt: string }> = {
  sniker: {
    title: 'Gabinete Sniker que puede ser usado como pc gamer gama alta',
    alt: 'Foto del Gabinete Sniker que puede ser usado como pc gamer gama alta con forma de tenis en color rojo con blanco',
  },
  shark: {
    title: 'Gabinete CYBERSHARK de PC Gamer CDMX para uso como pc gamer gama alta',
    alt: 'Foto de producto del Gabinete CYBERSHARK de PC Gamer CDMX para uso como pc gamer gama alta',
  },
  cpsula: {
    title: 'Torre estilo Cápsula de PC Gamer CDMX para uso como pc gamer gama alta',
    alt: 'Foto de producto de la Torre estilo Cápsula de PC Gamer CDMX para uso como pc gamer gama alta',
  },
  robot: {
    title: 'Gabinete estilo Robot de PC Gamer CDMX para uso como pc gamer gama alta',
    alt: 'Fotografía de un Gabinete estilo Robot de PC Gamer CDMX para uso como pc gamer gama alta',
  },
};

@Component({
  selector: 'app-high-end-pc',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './high-end-pc.component.html',
  styleUrl: './high-end-pc.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighEndPcComponent implements OnInit {
  private readonly requestedSlugs = ['sniker', 'shark', 'cpsula', 'robot'];
  readonly editorialCards: LandingAssemblyCard[] = [
    {
      title: 'HYPERION',
      description: 'Edición especial de alto rendimiento con componentes seleccionados para una experiencia entusiasta.',
      image: '/assets/img/ensambles/gama-alta/hyperion.jpg',
      imageTitle: 'Gabinete full white HYPERION para uso como pc gamer gama alta',
      imageAlt: 'Foto de producto del Gabinete full white HYPERION para uso como pc gamer gama alta',
      price: 85790,
      specs: [
        { label: 'Procesador', value: 'AMD RYZEN™ 7 9700X (USADO)' },
        { label: 'Tarjeta gráfica', value: 'KIT MSI EDICIÓN ESPECIAL FRIEREN, INCLUYE TARJETA DE VIDEO RTX5070TI 16GB, TECLADO, MOUSE Y MOUSE PAD' },
        { label: 'Memoria RAM', value: '64 GB DE MEMORIA RAM DDR5 (USADA)' },
        { label: 'Almacenamiento', value: '1 TB SSD M.2 PREDATOR' },
        { label: 'Tarjeta madre', value: 'ASUS TUF GAMING X870-PRO WIFI' },
      ],
      link: '/contacto',
      cta: 'Hablar con un asesor',
      source: 'editorial',
      badges: ['Ficha especial', 'USADO'],
    },
    {
      title: 'WORKSTATION',
      description: 'Configuración extrema para gaming, creación de contenido y cargas de trabajo profesionales.',
      image: '/assets/img/ensambles/gama-alta/workstation.jpg',
      imageTitle: 'Gabinete de la linea WORKSTATION para uso como pc gamer gama alta',
      imageAlt: 'Foto de producto del Gabinete de la linea WORKSTATION para uso como pc gamer gama alta',
      price: 315000,
      specs: [
        { label: 'Procesador', value: 'AMD RYZEN™ 7 9700X' },
        { label: 'Tarjeta gráfica', value: 'NVIDIA GEFORCE RTX 5090' },
        { label: 'Memoria RAM', value: '128GB SAMGUNG 2X64 DDR5-6400' },
        { label: 'Almacenamiento', value: '1TB SSD M.2 PREDATOR' },
        { label: 'Tarjeta madre', value: 'ASUS PRO WS TRX50-SAGE WIFI' },
      ],
      link: '/contacto',
      cta: 'Hablar con un asesor',
      source: 'editorial',
      badges: ['Ficha especial'],
    },
  ];

  readonly brands = [
    this.brand('AMD Ryzen', '/assets/img/marcas/AMD-Ryzen.png', 'Logo del AMD Ryzen una marca premium que se usa en una pc gamer gama alta'),
    this.brand('Asrock', '/assets/img/marcas/Asrock.png'),
    this.brand('asuspng', '/assets/img/marcas/asuspng.png'),
    this.brand('corsairbrand', '/assets/img/marcas/corsairbrand.png'),
    this.brand('EVGA', '/assets/img/marcas/EVGA.png'),
    this.brand('gigabyte', '/assets/img/marcas/gigabyte.png'),
    this.brand('hyperx', '/assets/img/marcas/hyperx.png'),
    this.brand('Intel', '/assets/img/marcas/Intel-qe15un7mdheilkp4kk4kc0rkl23pw8q1hb0dtjivj2.png'),
    this.brand('inwin', '/assets/img/marcas/inwin.png'),
    this.brand('kingston', '/assets/img/marcas/kingston.png'),
    this.brand('Logitech', '/assets/img/marcas/Logitech.png'),
    this.brand('MSI', '/assets/img/marcas/MSI-qe15ugmr1n5icayomza6ckfcfd05eczx4efzglsmlc.png'),
    this.brand('Noctua', '/assets/img/marcas/Noctua.png'),
    this.brand('NVIDIA', '/assets/img/marcas/Nvidia-qe15uqyz4tjnw0jnylr2lzteyll6r14yttmbqndasi.png'),
    this.brand('Redragon', '/assets/img/marcas/Redragon.png'),
    this.brand('thermaltake', '/assets/img/marcas/thermaltake.png'),
    this.brand('aerocool', '/assets/img/marcas/aerocool.png'),
  ];

  readonly faqs = [
    {
      question: '¿Qué diferencia hay entre gama alta y ultra extrema?',
      answer: 'La gama alta está optimizada para juegos en 4K y multitarea pesada con una excelente relación costo-beneficio entusiasta. La gama ultra extrema integra componentes de grado industrial o doble tarjeta gráfica, enfocados a simulaciones masivas y estaciones de trabajo profesionales.',
    },
    {
      question: '¿Tiene garantía extendida?',
      answer: 'Todas nuestras computadoras cuentan con un año de garantía directa contra cualquier defecto de fábrica. Además, te incluimos un servicio de mantenimiento preventivo completamente gratuito durante ese primer año para conservar tu equipo impecable.',
    },
    {
      question: '¿Se puede personalizar antes de comprarla armada?',
      answer: '¡Por supuesto! Puedes ajustar la memoria RAM, el almacenamiento SSD, el modelo del gabinete o agregar iluminación RGB a cualquiera de nuestros paquetes preconfigurados antes de realizar el armado final en tienda.',
    },
    {
      question: '¿Puedo ver el ensamble de mi equipo en vivo?',
      answer: 'Sí, en PC Gamer CDMX eres parte del proceso. Puedes acudir a nuestro local, seleccionar los componentes junto a nuestros asesores y presenciar el ensamble y las pruebas de tu pc gamer gama alta en tiempo real.',
    },
  ];

  catalogCards: LandingAssemblyCard[] = [];
  loading = true;

  get cards(): LandingAssemblyCard[] {
    return [...this.catalogCards, ...this.editorialCards];
  }

  constructor(
    private readonly productsService: ProductsService,
    private readonly seo: SeoService,
    private readonly cdr: ChangeDetectorRef,
    private readonly transferState: TransferState,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId) && this.transferState.hasKey(HIGH_END_PRODUCTS_STATE)) {
      const products = this.transferState.get(HIGH_END_PRODUCTS_STATE, []);
      this.transferState.remove(HIGH_END_PRODUCTS_STATE);
      this.applyProducts(products);
      return;
    }

    this.productsService.getAssembledPCsBySlugs(this.requestedSlugs)
      .pipe(take(1))
      .subscribe({
        next: (products) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(HIGH_END_PRODUCTS_STATE, products);
          }
          this.applyProducts(products);
        },
        error: () => {
          this.catalogCards = [];
          this.loading = false;
          this.updateSeo([]);
          this.cdr.markForCheck();
        },
      });
  }

  private applyProducts(products: AssembledPC[]): void {
    this.catalogCards = products.map((product) => this.toCatalogCard(product));
    this.loading = false;
    this.updateSeo(products);
    this.cdr.markForCheck();
  }

  private toCatalogCard(product: AssembledPC): LandingAssemblyCard {
    const imageMetadata = ASSEMBLY_IMAGE_METADATA[product.slug] ?? {
      title: `PC Gamer ${product.title} de gama alta`,
      alt: `Foto de producto de la PC Gamer ${product.title} de gama alta`,
    };
    const specs: LandingSpec[] = [];
    const add = (label: string, value?: string) => {
      const normalized = value?.trim();
      if (normalized) specs.push({ label, value: normalized });
    };

    add('Procesador', product.specifications.processor?.title);
    add('Tarjeta gráfica', product.specifications.graphicsCard?.title);
    add('Memoria RAM', product.specifications.ram?.title);
    add('Almacenamiento', product.specifications.storage?.map((item) => item.title).filter(Boolean).join(' + '));
    add('Tarjeta madre', product.specifications.motherboard?.title);
    add('Fuente de poder', product.specifications.powerSupply?.title);
    add('Gabinete', product.specifications.case?.title);
    add('Enfriamiento', product.specifications.cooling?.title);
    add('Ventiladores', product.specifications.fans);
    add('Certificación', product.certifications?.certificate);

    return {
      title: product.title,
      description: product.description,
      image: product.image,
      imageTitle: imageMetadata.title,
      imageAlt: imageMetadata.alt,
      price: product.discountedPrice ?? product.price,
      specs,
      link: `/ensambles/${product.slug}`,
      cta: 'Ver ensamble',
      source: 'catalog',
      badges: product.stock > 0 ? ['Disponible'] : ['Consultar disponibilidad'],
    };
  }

  private updateSeo(products: AssembledPC[]): void {
    const canonical = HIGH_END_PC_SEO.canonicalUrl;
    const productItems = products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.title,
        description: product.description,
        image: this.absoluteUrl(product.image),
        url: `https://pcgamercdmx.com/ensambles/${product.slug}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'MXN',
          price: product.discountedPrice ?? product.price,
          availability: product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: `https://pcgamercdmx.com/ensambles/${product.slug}`,
        },
      },
    }));
    const structuredData: SeoStructuredData[] = [
      {
        id: 'high-end-collection-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'PC Gamer Gama Alta en CDMX',
          description: 'Ensambles PC Gamer de gama alta para jugar en 4K, competir, crear contenido y trabajar en CDMX.',
          url: canonical,
        },
      },
      {
        id: 'high-end-breadcrumb-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://pcgamercdmx.com/' },
            { '@type': 'ListItem', position: 2, name: 'PC Gamer Gama Alta en CDMX', item: canonical },
          ],
        },
      },
      {
        id: 'high-end-item-list-schema',
        data: {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Ensambles PC Gamer de gama alta disponibles',
          numberOfItems: productItems.length,
          itemListElement: productItems,
        },
      },
    ];

    this.seo.updatePageStructuredData(structuredData);
  }

  private absoluteUrl(value: string): string {
    return value.startsWith('http') ? value : new URL(value, 'https://pcgamercdmx.com').toString();
  }

  private brand(name: string, image: string, alt = `Logo de ${name} una marca premium que se usa en una pc gamer gama alta`) {
    return {
      name,
      image,
      title: `${name} una marca premium que se usa en una pc gamer gama alta`,
      alt,
    };
  }
}
