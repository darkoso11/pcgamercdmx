import { of } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { AdminProductsDashboardComponent } from './admin-products-dashboard.component';

describe('AdminProductsDashboardComponent', () => {
  function createComponent() {
    const productsAdminService = {
      getCatalogDashboardStats: jasmine.createSpy('getCatalogDashboardStats').and.returnValue(of({
        total: 4,
        published: 3,
        draft: 1,
        lowStock: 1,
        outOfStock: 1,
        totalOffers: 2,
        activeOffers: 1,
      })),
      getRecentCatalogItems: jasmine.createSpy('getRecentCatalogItems').and.returnValue(of([])),
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const component = new AdminProductsDashboardComponent(
      productsAdminService as any,
      router as any,
      cdr as any
    );

    return { component, productsAdminService, router };
  }

  it('loads only product dashboard data', () => {
    const { component, productsAdminService } = createComponent();

    component.ngOnInit();

    expect(productsAdminService.getCatalogDashboardStats).toHaveBeenCalledOnceWith('products');
    expect(productsAdminService.getRecentCatalogItems).toHaveBeenCalledOnceWith('products', 5);
    expect(productsAdminService.getAllCategories).toHaveBeenCalled();
    expect(component.stats?.draft).toBe(1);
  });

  it('opens the product list with the selected metric filter', () => {
    const { component, router } = createComponent();

    component.goToStatus('draft');

    expect(router.navigate).toHaveBeenCalledOnceWith(
      [adminUrl('products/list')],
      { queryParams: { status: 'draft' } }
    );
  });

  it('shows the selected subcategory instead of a generic category label', () => {
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
});
