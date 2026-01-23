import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Packages } from './packages';

describe('Packages', () => {
  let component: Packages;
  let fixture: ComponentFixture<Packages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Packages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Packages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
