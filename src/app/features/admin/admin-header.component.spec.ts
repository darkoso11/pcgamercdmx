import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminHeaderComponent } from './admin-header.component';
import { AuthService } from './services/auth.service';

describe('AdminHeaderComponent', () => {
  it('allows its actions to wrap instead of overflowing on narrow screens', () => {
    const fixture = TestBed.configureTestingModule({
      imports: [AdminHeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: () => undefined } },
      ],
    }).createComponent(AdminHeaderComponent);

    fixture.detectChanges();

    const actions = fixture.nativeElement.querySelector('[data-testid="admin-header-actions"]') as HTMLElement;
    expect(actions.classList).toContain('flex-wrap');
    expect(actions.classList).toContain('justify-end');
  });
});
