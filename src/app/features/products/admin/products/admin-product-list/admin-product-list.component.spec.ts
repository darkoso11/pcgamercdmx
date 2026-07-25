import { of } from 'rxjs';
import { AdminProductListComponent } from './admin-product-list.component';

describe('AdminProductListComponent', () => {
  function createComponent(deleteResult = of(true)) {
    const productsAdminService = {
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of({ data: [] })),
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
      duplicateProduct: jasmine.createSpy('duplicateProduct').and.returnValue(of(undefined)),
      deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(deleteResult),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };

    const component = new AdminProductListComponent(
      productsAdminService as any,
      router as any,
      cdr as any
    );

    return { component, productsAdminService };
  }

  it('does not reload products or show success when delete service reports failure', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    const { component, productsAdminService } = createComponent(of(false));

    component.deleteProduct('123');

    expect(productsAdminService.deleteProduct).toHaveBeenCalledOnceWith('123');
    expect(productsAdminService.getAllProducts).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledOnceWith('No se pudo eliminar el producto. Intenta de nuevo.');
  });

  it('shows the selected subcategory name instead of the generic component label', () => {
    const { component } = createComponent();
    component.categories = [
      {
        _id: '2',
        name: 'Componentes',
        slug: 'componentes',
        order: 2,
        subcategories: [
          { _id: '13', name: 'Memorias RAM', slug: 'memorias-ram' },
        ],
      },
    ];
    const product = {
      category: 'componentes',
      categoryId: '2',
      subcategoryId: '13',
    };

    expect(component.getCategoryLabel(product as any)).toBe('Memorias RAM');
  });
});
