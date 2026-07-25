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

    return { component, productsAdminService, router };
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

  it('excludes assemblies from the generic product list', () => {
    const { component, productsAdminService } = createComponent();
    productsAdminService.getAllProducts.and.returnValue(of({
      data: [
        { _id: '871', title: 'CAPSULA', category: 'paquetes' },
        { _id: '18', title: 'Memoria XPG', category: 'componentes' },
      ],
    }));

    component.loadProducts();

    expect(component.products.map((product) => product._id)).toEqual(['18']);
  });

  it('routes assemblies to the assembly editor as a defensive fallback', () => {
    const { component, router } = createComponent();

    component.editProduct({ _id: '871', category: 'paquetes' } as any);

    expect(router.navigate).toHaveBeenCalledWith([
      component.adminAssembliesUrl,
      '871',
      'edit',
    ]);
  });

  it('uses the real canonical category name as the final fallback', () => {
    const { component } = createComponent();
    component.categories = [];

    expect(component.getCategoryLabel({ category: 'componentes' } as any)).toBe('Componentes');
  });
});
