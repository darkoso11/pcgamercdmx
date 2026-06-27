import { of } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { AdminProductsDashboardComponent } from './admin-products-dashboard.component';

describe('AdminProductsDashboardComponent', () => {
  function createComponent() {
    const productsAdminService = {
      getDashboardStats: jasmine.createSpy('getDashboardStats').and.returnValue(of(null)),
      getRecentProducts: jasmine.createSpy('getRecentProducts').and.returnValue(of([])),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };

    const component = new AdminProductsDashboardComponent(
      productsAdminService as any,
      router as any,
      cdr as any
    );

    return { component, router };
  }

  it('does not expose a separate package quick action', () => {
    const { component, router } = createComponent();

    component.goToSection('packages');

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
