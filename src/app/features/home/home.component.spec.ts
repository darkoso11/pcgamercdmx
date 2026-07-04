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

  it('does not define placeholder cabinet images for static assembly cards', () => {
    const staticImages = component.carruselProducts
      .map((product) => product.image)
      .filter(Boolean);

    expect(staticImages).toEqual([]);
  });
});
