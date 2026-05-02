import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Peripherals } from './peripherals';

describe('Peripherals', () => {
  let component: Peripherals;
  let fixture: ComponentFixture<Peripherals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Peripherals],
      providers: [provideRouter([])],
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
