import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { AdminProductEditorComponent } from './admin-product-editor.component';

describe('AdminProductEditorComponent', () => {
  function createComponent() {
    const productsAdminService = {
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
      getProductById: jasmine.createSpy('getProductById').and.returnValue(of(undefined)),
      createProduct: jasmine.createSpy('createProduct').and.returnValue(of({ title: 'Mouse Gamer' })),
      updateProduct: jasmine.createSpy('updateProduct').and.returnValue(of({ title: 'Mouse Gamer' })),
    };
    const route = { params: of({}) };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };

    const component = new AdminProductEditorComponent(
      new FormBuilder(),
      productsAdminService as any,
      route as any,
      router as any,
      cdr as any
    );

    return { component, productsAdminService };
  }

  it('sends the selected category slug when creating a product', () => {
    const { component, productsAdminService } = createComponent();
    component.categorias = [
      {
        _id: '3',
        name: 'Perifericos',
        slug: 'perifericos',
        order: 3,
        subcategories: [{ _id: '3-1', name: 'Mouse', slug: 'perifericos-mouse' }],
      },
    ];
    component.form.patchValue({
      productType: 'periferico',
      brand: 'Logitech',
      categoryId: '3',
      subcategoryId: '3-1',
      title: 'Mouse Gamer',
      slug: 'mouse-gamer',
      description: 'Mouse gamer inalambrico',
      price: 999,
      stock: 5,
      image: 'mouse.png',
      published: true,
    });

    component.saveProduct();

    expect(productsAdminService.createProduct).toHaveBeenCalled();
    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.category).toBe('perifericos');
  });

  it('falls back to the categoryId value when categories have not loaded yet', () => {
    const { component, productsAdminService } = createComponent();
    component.categorias = [];
    component.form.patchValue({
      productType: 'periferico',
      brand: 'Logitech',
      categoryId: 'perifericos',
      subcategoryId: 'mouse',
      title: 'Mouse Gamer',
      slug: 'mouse-gamer',
      description: 'Mouse gamer inalambrico',
      price: 999,
      stock: 5,
      image: 'mouse.png',
      published: true,
    });

    component.saveProduct();

    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.category).toBe('perifericos');
  });
});
