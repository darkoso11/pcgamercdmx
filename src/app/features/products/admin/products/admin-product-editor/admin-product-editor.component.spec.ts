import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { AuthService } from '../../../../admin/services/auth.service';
import { ProductsAdminService } from '../../shared/products-admin.service';
import { AdminProductEditorComponent } from './admin-product-editor.component';

describe('AdminProductEditorComponent', () => {
  function createComponent(createResult: any = of({ _id: 'product-123', title: 'Mouse Gamer' })) {
    const productsAdminService = {
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
      getProductById: jasmine.createSpy('getProductById').and.returnValue(of(undefined)),
      createProduct: jasmine.createSpy('createProduct').and.returnValue(createResult),
      updateProduct: jasmine.createSpy('updateProduct').and.returnValue(of({ _id: 'product-123', title: 'Mouse Gamer' })),
      uploadProductImage: jasmine.createSpy('uploadProductImage').and.returnValue(of('https://cms.test.pcgamercdmx.com/assets/file-1')),
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

    return { component, productsAdminService, router };
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

  it('keeps the saved subcategory when loading an existing product', () => {
    const { component, productsAdminService } = createComponent();
    productsAdminService.getProductById.and.returnValue(of({
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
    }));

    component.cargarProducto('123');

    expect(component.form.get('subcategoryId')?.value).toBe('3-1');
  });

  it('keeps the original category when editing before categories have loaded', () => {
    const { component, productsAdminService } = createComponent();
    component.isEditMode = true;
    component.productId = '871';
    component.categorias = [];
    productsAdminService.getProductById.and.returnValue(of({
      category: 'paquetes',
      productType: 'gabinete',
      brand: 'Otro',
      categoryId: '1',
      subcategoryId: '1',
      title: 'CAPSULA',
      slug: 'capsula',
      description: 'Ensamble personalizado CAPSULA',
      price: 4203,
      stock: 1,
      image: 'capsula.png',
      published: true,
    }));

    component.cargarProducto('871');
    component.saveProduct();

    const payload = productsAdminService.updateProduct.calls.mostRecent().args[1];
    expect(payload.category).toBe('paquetes');
    expect(payload.categoryId).toBe('1');
    expect(payload.subcategoryId).toBe('1');
  });

  it('refreshes subcategories after categories load for an existing product', () => {
    const { component, productsAdminService } = createComponent();
    component.form.patchValue({ categoryId: '3', subcategoryId: '3-1' }, { emitEvent: false });
    productsAdminService.getAllCategories.and.returnValue(of([
      {
        _id: '3',
        name: 'Perifericos',
        slug: 'perifericos',
        order: 3,
        subcategories: [{ _id: '3-1', name: 'Mouse', slug: 'perifericos-mouse' }],
      },
    ]));

    component.cargarCategorias();

    expect(component.subcategorias.length).toBe(1);
    expect(component.form.get('subcategoryId')?.value).toBe('3-1');
  });

  it('uploads selected images before creating a product record', () => {
    const { component, productsAdminService } = createComponent();
    const file = new File(['image'], 'mouse.jpeg', { type: 'image/jpeg' });
    (component as any).selectedMainImageFile = file;
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
      image: 'data:image/jpeg;base64,abc',
      published: true,
    });

    component.saveProduct();

    expect(productsAdminService.uploadProductImage).toHaveBeenCalledWith(file);
    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.image).toBe('https://cms.test.pcgamercdmx.com/assets/file-1');
  });

  it('publishes a product even when optional catalog fields are incomplete', () => {
    const { component, productsAdminService } = createComponent();
    component.form.patchValue({
      title: 'Producto Rapido',
      slug: 'producto-rapido',
    });

    component.saveProduct();

    expect(productsAdminService.createProduct).toHaveBeenCalled();
    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.published).toBeTrue();
  });

  it('shows an error instead of success when an update returns no saved product', () => {
    const { component, productsAdminService, router } = createComponent();
    productsAdminService.updateProduct.and.returnValue(of(undefined));
    component.isEditMode = true;
    component.productId = '123';
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

    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('No se pudo actualizar el producto. Verifica tu sesion y vuelve a intentar.');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keeps a newly created product open on its canonical edit route', () => {
    const { component, router } = createComponent();
    component.form.patchValue({ title: 'Mouse Gamer', slug: 'mouse-gamer' });

    component.saveProduct();

    expect(router.navigate).toHaveBeenCalledOnceWith([
      adminUrl('products'),
      'product-123',
      'edit',
    ]);
    expect(component.isEditMode).toBeTrue();
    expect(component.productId).toBe('product-123');
  });

  it('does not navigate after updating an existing product', () => {
    const { component, router } = createComponent();
    component.isEditMode = true;
    component.productId = 'product-123';
    component.form.patchValue({ title: 'Mouse Gamer', slug: 'mouse-gamer' });

    component.saveProduct();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('keeps a newly created product draft open on its canonical edit route', () => {
    const { component, router } = createComponent();
    component.form.patchValue({ title: 'Mouse Gamer', slug: 'mouse-gamer' });

    component.saveDraft();

    expect(router.navigate).toHaveBeenCalledOnceWith([
      adminUrl('products'),
      'product-123',
      'edit',
    ]);
  });

  it('does not navigate when product creation returns no saved record', () => {
    const { component, router } = createComponent(of(undefined));
    component.form.patchValue({ title: 'Mouse Gamer', slug: 'mouse-gamer' });

    component.saveProduct();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  describe('feedback placement', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [AdminProductEditorComponent],
        providers: [
          provideRouter([]),
          { provide: ActivatedRoute, useValue: { params: of({}) } },
          {
            provide: ProductsAdminService,
            useValue: {
              getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
            },
          },
          { provide: AuthService, useValue: { logout: jasmine.createSpy('logout') } },
        ],
      }).compileComponents();
    });

    it('shows the success message above and below the product form', () => {
      const fixture = TestBed.createComponent(AdminProductEditorComponent);
      fixture.componentInstance.successMessage = 'Producto actualizado en ambas posiciones';

      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text.split('Producto actualizado en ambas posiciones').length - 1).toBe(2);
    });

    it('shows the error message above and below the product form', () => {
      const fixture = TestBed.createComponent(AdminProductEditorComponent);
      fixture.componentInstance.errorMessage = 'Error de producto en ambas posiciones';

      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text.split('Error de producto en ambas posiciones').length - 1).toBe(2);
    });

    it('uses only the upper product feedback as an accessible announcer', () => {
      const fixture = TestBed.createComponent(AdminProductEditorComponent);
      fixture.componentInstance.successMessage = 'Producto actualizado';

      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('[data-editor-feedback-announcer="true"]').length).toBe(1);
    });
  });
});
