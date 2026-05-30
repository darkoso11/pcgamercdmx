import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProductsOverview } from './products-overview';
import { ProductsService } from '../services/products.service';

describe('ProductsOverview', () => {
  let component: ProductsOverview;
  let fixture: ComponentFixture<ProductsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsOverview],
      providers: [
        provideRouter([]),
        {
          provide: ProductsService,
          useValue: {
            getFeaturedCatalogProducts: () => of([]),
            toProductCardViewModel: () => ({}),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
