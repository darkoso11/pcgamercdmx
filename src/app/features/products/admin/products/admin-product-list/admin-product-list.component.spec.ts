import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { Product } from '../../shared/products-admin.service';
import { AdminProductListComponent } from './admin-product-list.component';

describe('AdminProductListComponent', () => {
  const product = (
    id: string,
    category: Product['category'],
    stock: number,
    published = true
  ): Product => ({
    _id: id,
    title: id,
    slug: id,
    description: id,
    category,
    price: 100,
    image: '',
    images: [],
    brandLogos: [],
    stock,
    lowStockAlert: 3,
    published,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  });

  function createComponent(status = 'all', deleteResult = of(true)) {
    const productsAdminService = {
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of({
        data: [
          product('out', 'componentes', 0),
          product('assembly', 'paquetes', 10, false),
          product('draft', 'perifericos', 8, false),
          product('low', 'componentes', 2),
          product('healthy', 'componentes', 10),
        ],
        total: 5,
      })),
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
      duplicateProduct: jasmine.createSpy('duplicateProduct').and.returnValue(of(undefined)),
      deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(deleteResult),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const route = { snapshot: { queryParamMap: convertToParamMap({ status }) } };
    const component = new AdminProductListComponent(
      productsAdminService as any,
      router as any,
      cdr as any,
      route as any
    );

    return { component, productsAdminService, router };
  }

  it('never includes assemblies and applies the draft filter from the URL', () => {
    const { component } = createComponent('draft');

    component.ngOnInit();

    expect(component.products.map((item) => item._id)).not.toContain('assembly');
    expect(component.filteredProducts.map((item) => item._id)).toEqual(['draft']);
    expect(component.selectedStatus).toBe('draft');
  });

  it('orders the unfiltered product list by the stock cascade', () => {
    const { component } = createComponent();

    component.ngOnInit();

    expect(component.filteredProducts.map((item) => item._id)).toEqual([
      'draft',
      'healthy',
      'low',
      'out',
    ]);
  });

  it('shows the selected subcategory name instead of a generic component label', () => {
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

  it('routes a listed product to the generic product editor', () => {
    const { component, router } = createComponent();

    component.editProduct('18');

    expect(router.navigate).toHaveBeenCalledWith([
      adminUrl('products'),
      '18',
      'edit',
    ]);
  });

  it('uses the canonical category name as the final fallback', () => {
    const { component } = createComponent();

    expect(component.getCategoryLabel({ category: 'componentes' } as any)).toBe('Componentes');
  });

  it('does not reload products or show success when deletion fails', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    const { component, productsAdminService } = createComponent('all', of(false));

    component.deleteProduct('123');

    expect(productsAdminService.deleteProduct).toHaveBeenCalledOnceWith('123');
    expect(productsAdminService.getAllProducts).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledOnceWith('No se pudo eliminar el producto. Intenta de nuevo.');
  });
});
