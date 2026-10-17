import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { DirectusApiService } from '../../core/services/directus-api.service';
import { ProductsService } from './services/products.service';
import { firstValueFrom, of } from 'rxjs';

describe('Public catalog navigation', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideRouter(routes), { provide: DirectusApiService, useValue: { isEnabled: () => false } }],
  }));

  it('opens Todos without redirecting and includes hardware and peripherals', async () => {
    const harness = await RouterTestingHarness.create('/productos');
    expect(TestBed.inject(Router).url).toBe('/productos');
    const text = harness.routeNativeElement!.textContent!;
    expect(text).toContain('Todos los productos');
    expect(text).toContain('Corsair K95');
    expect(text).toContain('Cable HDMI');
  });

  it('restores a category and search from a direct URL', async () => {
    const harness = await RouterTestingHarness.create('/productos/perifericos/keyboard?q=Corsair');
    expect(harness.routeNativeElement!.querySelector('input')?.value).toBe('Corsair');
    expect(harness.routeNativeElement!.textContent).toContain('Corsair K95');
    expect(harness.routeNativeElement!.textContent).not.toContain('Logitech G Pro X');
    expect(harness.routeNativeElement!.querySelector('[aria-current="page"]')?.textContent).toContain('Teclados');
  });

  it('combines price and brand filters from the URL', async () => {
    const harness = await RouterTestingHarness.create('/productos?brand=Logitech&min=2000&max=3000');
    const cards = harness.routeNativeElement!.querySelectorAll('article');
    expect(cards.length).toBe(1);
    expect(cards[0]?.textContent).toContain('Logitech G Pro X');
  });

  it('keeps an empty search recoverable within the current category', async () => {
    const harness = await RouterTestingHarness.create('/productos/perifericos/keyboard?q=nonexistent');
    expect(harness.routeNativeElement!.textContent).toContain('No hay productos con esos filtros');
    const clear = harness.routeNativeElement!.querySelector<HTMLButtonElement>('[data-clear-filters]');
    expect(clear).not.toBeNull();
    clear?.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/productos/perifericos/keyboard');
    expect(harness.routeNativeElement!.textContent).toContain('Corsair K95');
  });

  it('preserves source order even with equal, invalid and missing creation dates', async () => {
    const service = TestBed.inject(ProductsService);
    const products = (await firstValueFrom(service.getCatalogProducts())).slice(0, 4).reverse();
    products[0].createdAt = new Date('2020-01-01');
    products[1].createdAt = new Date('2020-01-01');
    products[2].createdAt = new Date('invalid');
    products[3].createdAt = undefined as unknown as Date;
    spyOn(service, 'getCatalogProducts').and.returnValue(of(products));
    const harness = await RouterTestingHarness.create('/productos');
    expect(Array.from(harness.routeNativeElement!.querySelectorAll('article h3')).map(node => node.textContent!.trim()))
      .toEqual(products.map(product => product.title));
    expect(harness.routeNativeElement!.textContent).not.toMatch(/recientes/i);
  });

  it('restores incremental loading and resets it when selecting a category', async () => {
    const service = TestBed.inject(ProductsService);
    const source = (await firstValueFrom(service.getPeripherals()))[0];
    const products = Array.from({ length: 52 }, (_, i) => ({ ...source, slug: `keyboard-${i}`, title: `Keyboard ${i}` }));
    spyOn(service, 'getCatalogProducts').and.returnValue(of(products));
    const harness = await RouterTestingHarness.create('/productos?q=Keyboard&page=2');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(48);
    harness.routeNativeElement!.querySelector<HTMLAnchorElement>('a[href*="perifericos/keyboard"]')!.click();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/productos/perifericos/keyboard?q=Keyboard');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(24);
  });

  it('keeps unresolved CMS subcategory IDs in their group without guessing membership', async () => {
    const service = TestBed.inject(ProductsService);
    const source = (await firstValueFrom(service.getPeripherals()))[0];
    const product = { ...source, title: 'Teclado con categoría sin resolver', subcategory: '19' };
    spyOn(service, 'getCatalogProducts').and.returnValue(of([product]));
    const harness = await RouterTestingHarness.create('/productos/perifericos');
    expect(harness.routeNativeElement!.textContent).toContain(product.title);
    expect(harness.routeNativeElement!.querySelector('a[href$="/keyboard"]')).toBeNull();
    await harness.navigateByUrl('/productos/perifericos/keyboard');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(0);
    expect(harness.routeNativeElement!.querySelector('[aria-current="page"]')?.textContent).toContain('Teclados');
  });

  it('joins published CMS IDs with legacy types and consolidates equivalent category names', async () => {
    const service = TestBed.inject(ProductsService);
    const source = (await firstValueFrom(service.getPeripherals()))[0];
    const api = TestBed.inject(DirectusApiService);
    spyOn(api, 'isEnabled').and.returnValue(true);
    api.readItems = jasmine.createSpy().and.callFake((collection: string) => of({ data: collection === 'pc_categories'
      ? [{ id: 3, slug: 'perifericos', published: true }]
      : [
          { id: 9, name: 'Teclados', slug: 'perifericos-keyboard', category_id: 3, published: true },
          { id: 15, name: 'TECLADOS', slug: 'perifericos-teclados', category_id: 3, published: true },
        ] }));
    spyOn(service, 'getCatalogProducts').and.returnValue(of([
      source, { ...source, slug: 'numeric-9', subcategory: '9' },
      { ...source, slug: 'numeric-15', subcategory: '15' },
    ]));
    const harness = await RouterTestingHarness.create('/productos/perifericos/keyboard');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(3);
    expect(Array.from(harness.routeNativeElement!.querySelectorAll('.category-chips a')).filter(node => /teclados/i.test(node.textContent!)).length).toBe(1);
    await harness.navigateByUrl('/productos/perifericos/perifericos-teclados');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(3);
    let snapshot = TestBed.inject(Router).routerState.snapshot.root;
    while (snapshot.firstChild) snapshot = snapshot.firstChild;
    expect(snapshot.data['canonicalPath']).toBe('/productos/perifericos/keyboard');
    expect(api.readItems).toHaveBeenCalledTimes(2);
  });

  it('recovers an unknown category within its group and preserves search', async () => {
    await RouterTestingHarness.create('/productos/perifericos/unknown?q=mouse');
    expect(TestBed.inject(Router).url).toBe('/productos/perifericos?q=mouse');
  });

  it('combines normalized brand, type and independent search words without guessing manufacturer', async () => {
    const service = TestBed.inject(ProductsService);
    const source = (await firstValueFrom(service.getPeripherals()))[0];
    spyOn(service, 'getCatalogProducts').and.returnValue(of([
      { ...source, slug: 'one', title: 'Pro modelo 900', description: 'Teclado', specifications: { ...source.specifications, brand: ' GIGABYTE ' } },
      { ...source, slug: 'two', title: 'Pro modelo 900', subcategory: 'mouse', specifications: { ...source.specifications, brand: 'Gigabyte' } },
      { ...source, slug: 'three', title: 'Compatible con Gigabyte Pro 900', specifications: { ...source.specifications, brand: 'Asus' } },
      { ...source, slug: 'four', title: 'Gigabyte Pro 900 sin marca', specifications: { ...source.specifications, brand: '' } },
    ]));
    const harness = await RouterTestingHarness.create('/productos?brand=gigabyte');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(2);
    await harness.navigateByUrl('/productos?brand=gigabyte&type=keyboard&q=900%20pro');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(1);
    expect(harness.routeNativeElement!.querySelector('article h3')?.textContent).toContain('Pro modelo 900');
    await harness.navigateByUrl('/productos');
    expect(harness.routeNativeElement!.querySelectorAll('article').length).toBe(4);
  });
});
