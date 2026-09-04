import { makeStateKey, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeoService } from '../../core/services/seo.service';
import { ProductsService } from '../products/services/products.service';
import { HighEndPcComponent } from './high-end-pc.component';

describe('HighEndPcComponent', () => {
  const assembly = (
    title: string,
    slug: string,
    gpu = 'RTX 5070',
    description = `${title} de gama alta`
  ) => ({
    title,
    slug,
    description,
    image: `/assets/${slug}.webp`,
    price: 50000,
    stock: 1,
    specifications: {
      processor: { title: 'Ryzen 7' },
      motherboard: { title: 'B650' },
      ram: { title: '32 GB DDR5' },
      storage: [{ title: '1 TB SSD M.2' }],
      graphicsCard: { title: gpu },
      powerSupply: { title: 'Fuente 750 W' },
      case: { title: 'Gabinete gamer' },
      cooling: { title: 'Enfriamiento líquido' },
      fans: '3 ventiladores',
    },
    certifications: { certificate: '80+ Gold', wattage: 750 },
  });

  it('renders four catalog assemblies and two advisor-only editorial fichas', async () => {
    const products = {
      getAssembledPCsBySlugs: jasmine.createSpy().and.returnValue(of([
        assembly('Sniker', 'sniker'),
        assembly('Shark', 'shark'),
        assembly('CÁPSULA', 'cpsula'),
        assembly('Robot', 'robot', ''),
      ])),
    };
    const seo = {
      update: jasmine.createSpy('update'),
      updatePageStructuredData: jasmine.createSpy('updatePageStructuredData'),
    };

    await TestBed.configureTestingModule({
      imports: [HighEndPcComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: products },
        { provide: SeoService, useValue: seo },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HighEndPcComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('[data-assembly-card]').length).toBe(6);
    expect(element.querySelectorAll('a[href^="/ensambles/"]').length).toBe(4);
    expect(element.querySelectorAll('[data-editorial-card] a[href="/contacto"]').length).toBe(2);
    expect(element.textContent).toContain('USADO');
    expect(element.querySelectorAll('details').length).toBe(4);
    expect(products.getAssembledPCsBySlugs).toHaveBeenCalledWith([
      'sniker', 'shark', 'cpsula', 'robot',
    ]);

    expect(seo.update).not.toHaveBeenCalled();
    expect(seo.updatePageStructuredData).toHaveBeenCalledTimes(1);
    const schemas = seo.updatePageStructuredData.calls.mostRecent().args[0];
    const itemList = schemas.find((item: any) => item.data['@type'] === 'ItemList');
    expect(itemList.data.itemListElement.length).toBe(4);
    expect(JSON.stringify(itemList.data)).not.toContain('HYPERION');
    expect(JSON.stringify(itemList.data)).not.toContain('WORKSTATION');

    const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-assembly-card]'));
    const cardNamed = (name: string) => cards.find((card) => card.querySelector('h3')?.textContent?.trim() === name)!;

    expect(cardNamed('Sniker').querySelector('img')?.getAttribute('title')).toBe(
      'Gabinete Sniker que puede ser usado como pc gamer gama alta'
    );
    expect(cardNamed('Sniker').querySelector('img')?.getAttribute('alt')).toBe(
      'Foto del Gabinete Sniker que puede ser usado como pc gamer gama alta con forma de tenis en color rojo con blanco'
    );
    expect(cardNamed('HYPERION').querySelector('img')?.getAttribute('src')).toBe(
      '/assets/img/ensambles/gama-alta/hyperion.jpg'
    );
    expect(cardNamed('HYPERION').querySelector('img')?.getAttribute('title')).toBe(
      'Gabinete full white HYPERION para uso como pc gamer gama alta'
    );
    expect(cardNamed('HYPERION').querySelector('img')?.getAttribute('alt')).toBe(
      'Foto de producto del Gabinete full white HYPERION para uso como pc gamer gama alta'
    );
    expect(cardNamed('HYPERION').textContent).toContain('64 GB DE MEMORIA RAM DDR5 (USADA)');
    expect(cardNamed('WORKSTATION').querySelector('img')?.getAttribute('src')).toBe(
      '/assets/img/ensambles/gama-alta/workstation.jpg'
    );
    expect(cardNamed('WORKSTATION').querySelector('img')?.getAttribute('title')).toBe(
      'Gabinete de la linea WORKSTATION para uso como pc gamer gama alta'
    );
    expect(cardNamed('WORKSTATION').querySelector('img')?.getAttribute('alt')).toBe(
      'Foto de producto del Gabinete de la linea WORKSTATION para uso como pc gamer gama alta'
    );
    expect(cardNamed('WORKSTATION').querySelector('[data-image-pending]')).toBeNull();

    const amdLogo = element.querySelector<HTMLImageElement>('.brand-grid img[src*="AMD-Ryzen"]')!;
    expect(amdLogo.getAttribute('title')).toBe(
      'AMD Ryzen una marca premium que se usa en una pc gamer gama alta'
    );
    expect(amdLogo.getAttribute('alt')).toBe(
      'Logo del AMD Ryzen una marca premium que se usa en una pc gamer gama alta'
    );
    expect(Array.from(element.querySelectorAll('.brand-grid img')).every((logo) =>
      logo.hasAttribute('title') && logo.getAttribute('alt')?.includes('una marca premium que se usa en una pc gamer gama alta')
    )).toBeTrue();
    expect(getComputedStyle(amdLogo).filter).toBe('none');
    expect(getComputedStyle(amdLogo).opacity).toBe('1');
  });

  it('applies Orbitron and signal intervention to page headings while cards stay static', async () => {
    const products = {
      getAssembledPCsBySlugs: jasmine.createSpy().and.returnValue(of([
        assembly('Sniker', 'sniker'),
        assembly('Shark', 'shark'),
        assembly('CÁPSULA', 'cpsula'),
        assembly('Robot', 'robot', ''),
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [HighEndPcComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: products },
        { provide: SeoService, useValue: { updatePageStructuredData: jasmine.createSpy('updatePageStructuredData') } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HighEndPcComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const normalize = (value: string | null | undefined) => value?.replace(/\s+/g, ' ').trim();
    const page = element.querySelector<HTMLElement>('.high-end-page')!;
    const heroTitle = element.querySelector<HTMLElement>('.hero h1')!;
    const sectionTitles = Array.from(element.querySelectorAll<HTMLElement>('h2'));
    const assemblyTitles = Array.from(element.querySelectorAll<HTMLElement>('[data-assembly-card] h3'));
    const controls = Array.from(element.querySelectorAll<HTMLElement>('.button, summary'));

    expect(getComputedStyle(page).fontFamily).toContain('Orbitron');
    expect(heroTitle.hasAttribute('data-glitch')).toBeTrue();
    expect(heroTitle.dataset['text']).toBe('PC Gamer Gama Alta en CDMX');
    expect(getComputedStyle(heroTitle).animationDuration).toBe('3.65s');
    expect(sectionTitles.length).toBeGreaterThan(0);
    expect(sectionTitles.every((title) =>
      title.hasAttribute('data-glitch') && title.dataset['text'] === normalize(title.textContent)
    )).toBeTrue();
    expect(assemblyTitles.length).toBe(6);
    expect(assemblyTitles.every((title) => !title.hasAttribute('data-glitch'))).toBeTrue();
    expect(controls.length).toBeGreaterThan(0);
    expect(controls.every((control) => control.classList.contains('signal-control'))).toBeTrue();
  });

  it('uses proportional hero type and media-first vertical assembly cards', async () => {
    const products = {
      getAssembledPCsBySlugs: jasmine.createSpy().and.returnValue(of([
        assembly('Sniker', 'sniker'),
        assembly('Shark', 'shark'),
        assembly('CÁPSULA', 'cpsula'),
        assembly('Robot', 'robot', ''),
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [HighEndPcComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: products },
        { provide: SeoService, useValue: { updatePageStructuredData: jasmine.createSpy('updatePageStructuredData') } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HighEndPcComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const heroTitle = element.querySelector<HTMLElement>('.hero h1')!;
    const sectionTitles = Array.from(element.querySelectorAll<HTMLElement>('.section-shell h2, .performance h2'));
    const assemblyGrid = element.querySelector<HTMLElement>('.assembly-grid')!;
    const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-assembly-card]'));

    expect(Number.parseFloat(getComputedStyle(heroTitle).fontSize)).toBeLessThanOrEqual(60);
    expect(sectionTitles.length).toBeGreaterThan(0);
    expect(sectionTitles.every((title) => title.dataset['glitchStrength'] === 'section')).toBeTrue();
    expect(assemblyGrid.classList).toContain('auto-rows-fr');
    expect(cards.length).toBe(6);
    expect(cards.every((card) => card.classList.contains('h-full'))).toBeTrue();
    expect(cards.every((card) => card.dataset['cardLayout'] === 'vertical')).toBeTrue();
    expect(cards.every((card) => card.querySelector('.assembly-card__scanline') === null)).toBeTrue();
    expect(cards.every((card) => {
      const children = Array.from(card.children);
      return children[0]?.classList.contains('assembly-card__media')
        && children[1]?.classList.contains('assembly-card__body');
    })).toBeTrue();
    expect(cards.every((card) => card.querySelector('.assembly-card__footer .assembly-card__price'))).toBeTrue();
    expect(cards.every((card) => card.querySelector('.assembly-card__footer .button--card'))).toBeTrue();
  });

  it('collapses only long descriptions and expands the selected card accessibly', async () => {
    const mediumDescription = 'R'.repeat(300);
    const longDescription = 'Descripción extensa para explicar todos los detalles técnicos y estéticos del ensamble. '.repeat(6);
    const products = {
      getAssembledPCsBySlugs: jasmine.createSpy().and.returnValue(of([
        assembly('Sniker', 'sniker', 'RTX 5070', mediumDescription),
        assembly('Shark', 'shark', 'RTX 5070', longDescription),
        assembly('CÁPSULA', 'cpsula'),
        assembly('Robot', 'robot', ''),
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [HighEndPcComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: products },
        { provide: SeoService, useValue: { updatePageStructuredData: jasmine.createSpy('updatePageStructuredData') } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HighEndPcComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const cards = Array.from(element.querySelectorAll<HTMLElement>('[data-assembly-card]'));
    const cardNamed = (name: string) => cards.find((card) => card.querySelector('h3')?.textContent?.trim() === name)!;
    const sharkCard = cardNamed('Shark');
    const description = sharkCard.querySelector<HTMLElement>('[data-assembly-description]')!;
    const toggle = sharkCard.querySelector<HTMLButtonElement>('[data-description-toggle]')!;

    expect(cardNamed('Sniker').querySelector('[data-description-toggle]')).toBeNull();
    expect(description.classList).toContain('assembly-card__description--collapsed');
    expect(toggle.textContent).toContain('Ver más');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(description.id);

    toggle.click();
    fixture.detectChanges();

    expect(description.classList).not.toContain('assembly-card__description--collapsed');
    expect(toggle.textContent).toContain('Ver menos');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps the approved marketing copy and routes the catalog actions correctly', async () => {
    const products = {
      getAssembledPCsBySlugs: jasmine.createSpy().and.returnValue(of([
        assembly('Sniker', 'sniker'),
        assembly('Shark', 'shark'),
        assembly('CÁPSULA', 'cpsula'),
        assembly('Robot', 'robot', ''),
      ])),
    };

    await TestBed.configureTestingModule({
      imports: [HighEndPcComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: products },
        { provide: SeoService, useValue: { updatePageStructuredData: jasmine.createSpy('updatePageStructuredData') } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HighEndPcComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const text = element.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(element.querySelector('[data-all-assemblies-cta]')?.getAttribute('href')).toBe('/ensambles');
    expect(element.querySelector('[data-build-pc-cta]')?.getAttribute('href')).toBe('/contacto');
    expect(element.querySelector('[data-contact-cta]')?.getAttribute('href')).toBe('/contacto');
    expect(text).toContain('configurar componentes de máxima potencia requiere precisión técnica');
    expect(text).toContain('tasas de refresco competitivas superiores a 144 FPS');
    expect(text).toContain('Dominar los títulos más exigentes del mercado requiere hardware de primer nivel ensamblado por expertos.');
    expect(text).toContain('¡Contáctanos hoy mismo!');
  });

  it('uses prerendered catalog data instead of clearing cards when the browser cannot reach Directus', async () => {
    const transferredProducts = [
      assembly('Sniker', 'sniker'),
      assembly('Shark', 'shark'),
      assembly('CÁPSULA', 'cpsula'),
      assembly('Robot', 'robot', ''),
    ];
    const products = {
      getAssembledPCsBySlugs: jasmine.createSpy().and.returnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [HighEndPcComponent],
      providers: [
        provideRouter([]),
        { provide: ProductsService, useValue: products },
        { provide: SeoService, useValue: { updatePageStructuredData: jasmine.createSpy('updatePageStructuredData') } },
      ],
    }).compileComponents();

    TestBed.inject(TransferState).set(
      makeStateKey<any[]>('pc-gamer-gama-alta-products-v1'),
      transferredProducts
    );

    const fixture = TestBed.createComponent(HighEndPcComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelectorAll('[data-assembly-card]').length).toBe(6);
    expect(element.textContent).not.toContain('El catálogo activo no está disponible');
    expect(products.getAssembledPCsBySlugs).not.toHaveBeenCalled();
  });
});
