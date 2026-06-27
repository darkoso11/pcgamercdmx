import { FormBuilder } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';
import { throwError, of } from 'rxjs';
import { AdminAssemblyEditorComponent } from './admin-assembly-editor.component';

describe('AdminAssemblyEditorComponent', () => {
  function createComponent(createResult = of({ title: 'PC Lista' })) {
    const productsAdminService = {
      getProductById: jasmine.createSpy('getProductById').and.returnValue(of(undefined)),
      createProduct: jasmine.createSpy('createProduct').and.returnValue(createResult),
      updateProduct: jasmine.createSpy('updateProduct').and.returnValue(createResult),
      uploadProductImage: jasmine.createSpy('uploadProductImage').and.returnValue(of('https://cms.test.pcgamercdmx.com/assets/file-1')),
    };
    const route = { params: of({}) };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };

    const component = new AdminAssemblyEditorComponent(
      new FormBuilder(),
      productsAdminService as any,
      route as any,
      router as any,
      cdr as any
    );

    component.form.patchValue({
      title: 'PC Lista',
      slug: 'pc-lista',
      description: 'PC lista para jugar en alto rendimiento',
      processor: 'Ryzen 7',
      motherboard: 'B650',
      graphicsCard: 'RTX 4070',
      ram: '32GB DDR5',
      nvmeSsd: '1TB NVMe',
      powerSupply: '750W Gold',
      cooling: 'Liquid 240',
      case: 'Flow RGB',
      price: 20000,
      stock: 2,
      image: 'pc.png',
      published: true,
    });

    return { component, productsAdminService, router };
  }

  it('stops loading and navigates after creating an assembly', fakeAsync(() => {
    const { component, productsAdminService, router } = createComponent();

    component.saveAssembly();
    tick(1500);

    expect(productsAdminService.createProduct).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
    expect(component.successMessage).toBe('Ensamble creado y publicado correctamente');
    expect(router.navigate).toHaveBeenCalledWith([component.adminProductsUrl]);
  }));

  it('forces published true when using the publish action', () => {
    const { component, productsAdminService } = createComponent();
    component.form.patchValue({ published: false });

    component.saveAssembly();

    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.published).toBeTrue();
  });

  it('uploads selected images before creating an assembly record', () => {
    const { component, productsAdminService } = createComponent();
    const file = new File(['image'], 'pc.jpeg', { type: 'image/jpeg' });
    (component as any).selectedMainImageFile = file;
    component.form.patchValue({ image: 'data:image/jpeg;base64,abc' });

    component.saveAssembly();

    expect(productsAdminService.uploadProductImage).toHaveBeenCalledWith(file);
    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.image).toBe('https://cms.test.pcgamercdmx.com/assets/file-1');
  });

  it('stops loading and shows an error when assembly creation fails', () => {
    spyOn(console, 'error');
    const { component } = createComponent(throwError(() => new Error('Directus rejected payload')));

    component.saveAssembly();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Error al publicar el ensamble');
  });
});
