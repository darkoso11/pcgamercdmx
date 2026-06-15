import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Components } from './components';
import { ProductsService } from '../services/products.service';

describe('Components', () => {
  let component: Components;
  let fixture: ComponentFixture<Components>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Components],
      providers: [
        provideRouter([]),
        {
          provide: ProductsService,
          useValue: {
            getHardwareAndAccessories: () => of([]),
            toProductCardViewModel: () => ({}),
          },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Components);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
