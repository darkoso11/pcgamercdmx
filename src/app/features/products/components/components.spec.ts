import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Components } from './components';

describe('Components', () => {
  let component: Components;
  let fixture: ComponentFixture<Components>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Components],
      providers: [provideRouter([])],
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
