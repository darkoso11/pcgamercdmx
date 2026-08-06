import { of } from 'rxjs';
import { AdminCategoryHierarchyManagerComponent } from './admin-category-hierarchy-manager.component';

describe('AdminCategoryHierarchyManagerComponent', () => {
  function createComponent(domain: 'products' | 'assemblies') {
    const productsAdminService = {
      getCategoriesByDomain: jasmine.createSpy('getCategoriesByDomain').and.returnValue(of([])),
    };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const route = { snapshot: { data: { catalogDomain: domain } } };
    const component = new AdminCategoryHierarchyManagerComponent(
      productsAdminService as any,
      cdr as any,
      route as any
    );

    return { component, productsAdminService };
  }

  it('loads only product category roots on the product route', () => {
    const { component, productsAdminService } = createComponent('products');

    component.ngOnInit();

    expect(productsAdminService.getCategoriesByDomain).toHaveBeenCalledOnceWith('products');
    expect(component.catalogDomain).toBe('products');
  });

  it('loads only the assembly root on the assembly route', () => {
    const { component, productsAdminService } = createComponent('assemblies');

    component.ngOnInit();

    expect(productsAdminService.getCategoriesByDomain).toHaveBeenCalledOnceWith('assemblies');
    expect(component.catalogDomain).toBe('assemblies');
  });
});
