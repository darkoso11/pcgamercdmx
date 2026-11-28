import { ComponentFixture, DeferBlockState, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { CommunityService } from '../community/community.service';
import { ProductsService } from '../products/services/products.service';
import { BlogService } from '../blog/services/blog.service';
import { HomeContentService } from './services/home-content.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let blogService: {
    listPublished: jasmine.Spy;
  };

  beforeEach(async () => {
    blogService = {
      listPublished: jasmine.createSpy().and.returnValue(
        of({
          data: [
            {
              _id: 'newest',
              title: 'Entrada real más reciente',
              slug: 'entrada-real-reciente',
              summary: 'Resumen editorial reciente.',
              coverImage: {
                url: 'https://cms.test/assets/cover-new',
                alt: 'Portada reciente',
              },
              published: true,
              publishedAt: '2026-07-30T03:00:00.000Z',
              sections: [],
              tags: [],
            },
            {
              _id: 'previous',
              title: 'Entrada real anterior',
              slug: 'entrada-real-anterior',
              summary: 'Resumen editorial anterior.',
              published: true,
              publishedAt: '2026-07-29T03:00:00.000Z',
              sections: [],
              tags: [],
            },
          ],
          total: 2,
        })
      ),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsService,
          useValue: {
            getHomeSliderProducts: () => of({ assemblies: [], peripherals: [] }),
          },
        },
        {
          provide: CommunityService,
          useValue: {
            getFeaturedCollaborators: () => of([]),
          },
        },
        {
          provide: BlogService,
          useValue: blogService,
        },
        {
          provide: HomeContentService,
          useValue: {
            getSettings: () =>
              of({
                banners: [],
                heroBanners: [],
                showUpcomingEvents: false,
                events: [],
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });



  it('keeps slider ordering deterministic between prerender and hydration', () => {
    spyOn(Math, 'random').and.returnValues(0, 0, 0, 0.99, 0.99, 0.99);
    const items = [{ slug: 'one' }, { slug: 'two' }, { slug: 'three' }];

    const serverOrder = (component as any).orderSliderItems(items);
    const browserOrder = (component as any).orderSliderItems(items);

    expect(browserOrder).toEqual(serverOrder);
  });

  it('renders the welcome immediately and links the home CTA to the configured store', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain(component.fullText);
    const links = Array.from(fixture.nativeElement.querySelectorAll('a.store-link')) as HTMLAnchorElement[];
    expect(links.length).toBe(2);
    for (const link of links) {
      expect(link.href).toBe(component.business.mapDirectionsUrl);
      expect(link.textContent).toContain('Ir a la tienda');
    }
  });

  it('writes the welcome progressively and rotates banners without arrows', fakeAsync(() => {
    const isolated = TestBed.createComponent(HomeComponent);
    isolated.detectChanges();
    expect(isolated.componentInstance.typingText).toBe('');
    tick(580);
    expect(isolated.componentInstance.typingText.length).toBeGreaterThan(0);
    expect(isolated.componentInstance.typingText.length).toBeLessThan(isolated.componentInstance.fullText.length);
    tick(1500);
    expect(isolated.componentInstance.typingText).toBe(isolated.componentInstance.fullText);
    expect(isolated.nativeElement.querySelector('.slider-arrow')).toBeNull();
    isolated.destroy();
  }));

  it('keeps the official logo first after home settings load', fakeAsync(() => {
    const isolated = TestBed.createComponent(HomeComponent);
    isolated.detectChanges();
    tick(3500);
    expect(isolated.componentInstance.sliderImages[0]?.src).toBe('assets/img/leon-160.webp');
    isolated.destroy();
  }));

  it('keeps the assembly slider empty when the backend returns no assemblies', () => {
    expect(component.carruselProducts).toEqual([]);
  });

  it('links the packages section to the high-end PC landing page', async () => {
    const [packagesBlock] = await fixture.getDeferBlocks();
    await packagesBlock.render(DeferBlockState.Complete);
    const link = fixture.nativeElement.querySelector(
      'a[href="/pc-gamer-gama-alta"]'
    ) as HTMLAnchorElement | null;

    expect(link).not.toBeNull();
    expect(link?.textContent).toContain('Explorar PC Gamer gama alta');
  });

  it('shows the most recent published Directus posts instead of sample posts', fakeAsync(() => {
    blogService.listPublished.calls.reset();
    const isolatedFixture = TestBed.createComponent(HomeComponent);
    isolatedFixture.detectChanges();

    tick(3_500);

    expect(blogService.listPublished).toHaveBeenCalledWith({ limit: 3 });
    expect(isolatedFixture.componentInstance.latestPosts.map((post) => post.title)).toEqual([
      'Entrada real más reciente',
      'Entrada real anterior',
    ]);
    expect(isolatedFixture.componentInstance.latestPosts.map((post) => post.slug)).not.toContain(
      'mejores-tarjetas-graficas-2024'
    );
    isolatedFixture.destroy();
  }));

  it('maps only the brand logos explicitly configured for the assembly', () => {
    const sliderItem = (component as any).toPackageSliderItem(
      {
        id: 7,
        title: 'Ensamble editorial',
        slug: 'ensamble-editorial',
        image: 'ensamble.png',
        price: 25000,
        description: 'Ensamble de prueba',
        specifications: {
          processor: { title: 'Intel Core i7' },
          motherboard: { title: 'ASUS ROG B760' },
          ram: { title: '32 GB' },
          storage: [{ title: '1 TB NVMe' }],
          graphicsCard: { title: 'NVIDIA RTX 4070' },
        },
        certifications: { certificate: '80+ Gold', wattage: 750 },
        brandLogos: [{ name: 'Corsair', logo: 'assets/img/marcas/corsairbrand.png' }],
      },
      0
    );

    expect(sliderItem.brandLogos).toEqual([
      { src: 'assets/img/marcas/corsairbrand.png', alt: 'Corsair' },
    ]);
  });

  it('maps the effective offer and selected power certification to the assembly slider', () => {
    const sliderItem = (component as any).toPackageSliderItem(
      {
        id: 8,
        title: 'Ensamble en oferta',
        slug: 'ensamble-oferta',
        image: 'ensamble.png',
        price: 30000,
        discountedPrice: 27000,
        offerBadgeVisible: false,
        description: 'Ensamble de prueba',
        specifications: {
          processor: { title: 'AMD Ryzen 7' },
          motherboard: { title: 'B650' },
          ram: { title: '32 GB' },
          storage: [{ title: '1 TB NVMe' }],
          graphicsCard: { title: 'RTX 4070' },
        },
        certifications: {
          certificate: 'Cybenetics Platinum',
          image: 'https://cms.test/assets/platinum',
          wattage: 850,
        },
        brandLogos: [],
      },
      0
    );

    expect(sliderItem.price).toBe(27000);
    expect(sliderItem.originalPrice).toBe(30000);
    expect(sliderItem.showOfferBadge).toBeFalse();
    expect(sliderItem.powerCertificate).toBe('https://cms.test/assets/platinum');
    expect(sliderItem.powerCertificateName).toBe('Cybenetics Platinum');
  });
});
