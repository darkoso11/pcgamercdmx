import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeBlogSectionComponent } from './home-blog-section.component';

describe('HomeBlogSectionComponent', () => {
  let fixture: ComponentFixture<HomeBlogSectionComponent>;
  let component: HomeBlogSectionComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeBlogSectionComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeBlogSectionComponent);
    component = fixture.componentInstance;
  });

  it('uses an editorial fallback instead of a broken placeholder image', () => {
    component.posts = [
      {
        title: 'Entrada real sin portada',
        excerpt: 'Resumen real',
        image: '',
        date: new Date('2026-07-30T03:00:00.000Z'),
        slug: 'entrada-real',
      },
    ];

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('article img')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('[data-testid="blog-cover-fallback"]')
        .textContent
    ).toContain('PCG');
  });
});
