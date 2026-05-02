import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductsOverview } from './products-overview';

describe('ProductsOverview', () => {
  let component: ProductsOverview;
  let fixture: ComponentFixture<ProductsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsOverview],
      providers: [provideRouter([])],
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
