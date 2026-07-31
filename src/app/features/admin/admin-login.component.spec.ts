import { of } from 'rxjs';
import { AdminLoginComponent } from './admin-login.component';

describe('AdminLoginComponent', () => {
  it('passes the selected session duration to authentication', async () => {
    const auth = {
      login: jasmine.createSpy().and.returnValue(of({ token: 'access' })),
    };
    const router = {
      navigate: jasmine.createSpy(),
    };
    const component = new AdminLoginComponent(auth as any, router as any);
    component.email = 'admin@example.test';
    component.password = 'secret';
    (component as any).sessionDuration = '7d';

    await component.onSubmit();

    expect(auth.login).toHaveBeenCalledWith(
      'admin@example.test',
      'secret',
      '7d'
    );
  });
});
