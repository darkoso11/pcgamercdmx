import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home.component';
import { CommunityService } from '../community/community.service';
import { ProductsService } from '../products/services/products.service';
import { HomeContentService } from './services/home-content.service';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsService,
          useValue: {
            getAssembledPCs: () => of([]),
            getPeripherals: () => of([]),
          },
        },
        {
          provide: CommunityService,
          useValue: {
            getFeaturedCollaborators: () => of([]),
          },
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

  it('shows the newly published site notice in the hero', () => {
    const notice = fixture.nativeElement.querySelector('.launch-notice');

    expect(notice).not.toBeNull();
    expect(notice.textContent).toContain('Sitio recien publicado');
    expect(notice.textContent).toContain('Gracias por tu paciencia');
  });

  it('keeps the assembly slider empty when the backend returns no assemblies', () => {
    expect(component.carruselProducts).toEqual([]);
    expect(component.filteredCarruselProducts).toEqual([]);
  });

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
});
