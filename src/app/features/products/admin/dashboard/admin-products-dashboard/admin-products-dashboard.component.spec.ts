import { of } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { AdminProductsDashboardComponent } from './admin-products-dashboard.component';

describe('AdminProductsDashboardComponent', () => {
  function createComponent() {
    const productsAdminService = {
      getDashboardStats: jasmine.createSpy('getDashboardStats').and.returnValue(of(null)),
      getRecentProducts: jasmine.createSpy('getRecentProducts').and.returnValue(of([])),
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
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

  it('shows the selected subcategory on the dashboard', () => {
    const { component } = createComponent();
    component.categories = [{
      _id: '2',
      name: 'Componentes',
      slug: 'componentes',
      order: 2,
      subcategories: [{ _id: '13', name: 'Memorias RAM', slug: 'memorias-ram' }],
    }];

    expect(component.getCategoryLabel({
      category: 'componentes',
      categoryId: '2',
      subcategoryId: '13',
    } as any)).toBe('Memorias RAM');
  });

  it('does not invent a hardware and accessories category', () => {
    const { component } = createComponent();

    expect(component.getCategoryLabel({ category: 'componentes' } as any)).toBe('Componentes');
  });

  it('routes an assembly from the dashboard to the assembly editor', () => {
    const { component, router } = createComponent();

    component.editProduct({ _id: '871', category: 'paquetes' } as any);

    expect(router.navigate).toHaveBeenCalledWith([
      adminUrl('products/assemblies'),
      '871',
      'edit',
    ]);
  });
});
