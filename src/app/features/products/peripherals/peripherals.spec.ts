import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Peripherals } from './peripherals';
import { ProductsService } from '../services/products.service';

describe('Peripherals', () => {
  let component: Peripherals;
  let fixture: ComponentFixture<Peripherals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Peripherals],
      providers: [
        provideRouter([]),
        {
          provide: ProductsService,
          useValue: {
            getPeripherals: () => of([]),
            toProductCardViewModel: () => ({}),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Peripherals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
