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
      getPowerCertifications: jasmine.createSpy('getPowerCertifications').and.returnValue(of([
        {
          _id: 'cert-gold',
          name: '80 Plus Gold',
          image: 'https://cms.test.pcgamercdmx.com/assets/gold',
          active: true,
          sort: 1,
        },
      ])),
      createPowerCertification: jasmine.createSpy('createPowerCertification').and.returnValue(of({
        _id: 'cert-platinum',
        name: '80 Plus Platinum',
        image: 'https://cms.test.pcgamercdmx.com/assets/platinum',
        active: true,
        sort: 2,
      })),
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
      watts: 750,
      powerCertificationId: 'cert-gold',
      cooling: 'Liquid 240',
      case: 'Flow RGB',
      operatingSystem: 'Windows 11 Pro',
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
    expect(router.navigate).toHaveBeenCalledWith([component.adminAssembliesUrl]);
  }));

  it('forces published true when using the publish action', () => {
    const { component, productsAdminService } = createComponent();
    component.form.patchValue({ published: false });

    component.saveAssembly();

    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.published).toBeTrue();
  });

  it('provides a form control for selecting assembly brand logos', () => {
    const { component } = createComponent();

    expect(component.form.contains('brandLogos')).toBeTrue();
  });

  it('leaves promotional pricing and publication state to their explicit admin actions', () => {
    const { component } = createComponent();

    expect(component.form.contains('discountPrice')).toBeFalse();
    expect(component.form.contains('discountPercent')).toBeFalse();
    expect(component.form.contains('published')).toBeFalse();
  });

  it('includes the selected brand logos in the published payload', () => {
    const { component, productsAdminService } = createComponent();
    const selectedLogos = [
      { src: 'assets/img/marcas/nvidia_tag.svg', alt: 'NVIDIA' },
      { src: 'assets/img/marcas/intel_tag.svg', alt: 'Intel' },
    ];
    component.form.patchValue({ brandLogos: selectedLogos });

    component.saveAssembly();

    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload.brandLogos).toEqual(selectedLogos);
  });

  it('restores saved brand logos when editing an assembly', () => {
    const { component, productsAdminService } = createComponent();
    const savedLogos = [{ src: 'assets/img/marcas/ryzen_tag.svg', alt: 'AMD' }];
    productsAdminService.getProductById.and.returnValue(
      of({
        title: 'PC AMD',
        slug: 'pc-amd',
        description: 'Ensamble AMD listo para jugar',
        price: 18000,
        stock: 1,
        image: 'amd.png',
        brandLogos: savedLogos,
      })
    );

    component.loadAssembly('pc-amd');

    expect(component.form.get('brandLogos')?.value).toEqual(savedLogos);
  });

  it('recognizes and replaces a legacy AMD Ryzen logo without duplicating the brand', () => {
    const { component } = createComponent();
    const amdOption = component.brandOptions.find((brand) => brand.alt === 'AMD')!;
    component.form.patchValue({
      brandLogos: [
        { src: 'assets/img/marcas/AMD-Ryzen.png', alt: 'AMD Ryzen' },
      ],
    });

    expect(component.isBrandSelected(amdOption)).toBeTrue();

    component.toggleBrandLogo(amdOption, true);

    expect(component.form.get('brandLogos')?.value).toEqual([amdOption]);
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

  it('blocks publication when required public catalog fields are incomplete', () => {
    const { component, productsAdminService } = createComponent();
    component.form.reset({
      title: 'Ensamble Rapido',
      slug: 'ensamble-rapido',
      published: false,
    });

    component.saveAssembly();

    expect(productsAdminService.createProduct).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Completa los campos obligatorios antes de publicar el ensamble.');
  });

  it('persists watts, selected certification and operating system in the assembly payload', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();

    component.saveAssembly();

    const payload = productsAdminService.createProduct.calls.mostRecent().args[0];
    expect(payload).toEqual(jasmine.objectContaining({
      watts: 750,
      powerCertificationId: 'cert-gold',
      powerCertificate: '80 Plus Gold',
      powerCertificateImage: 'https://cms.test.pcgamercdmx.com/assets/gold',
      operatingSystem: 'Windows 11 Pro',
    }));
  });

  it('registers a new reusable certification and selects it for the assembly', () => {
    const { component, productsAdminService } = createComponent();
    const file = new File(['platinum'], 'platinum.png', { type: 'image/png' });
    (component as any).newCertificationName = '80 Plus Platinum';
    (component as any).selectedCertificationImageFile = file;

    (component as any).saveNewCertification();

    expect(productsAdminService.createPowerCertification)
      .toHaveBeenCalledWith('80 Plus Platinum', file);
    expect(component.form.get('powerCertificationId')?.value).toBe('cert-platinum');
  });

  it('stops loading and shows an error when assembly creation fails', () => {
    spyOn(console, 'error');
    const { component } = createComponent(throwError(() => new Error('Directus rejected payload')));

    component.saveAssembly();

    expect(component.loading).toBeFalse();
    expect(component.errorMessage).toBe('Error al publicar el ensamble');
  });

  it('shows an error instead of success when an update returns no saved assembly', () => {
    const { component, productsAdminService } = createComponent();
    productsAdminService.updateProduct.and.returnValue(of(undefined));
    component.isEditMode = true;
    component.productId = '123';

    component.saveAssembly();

    expect(component.successMessage).toBe('');
    expect(component.errorMessage).toBe('No se pudo actualizar el ensamble. Verifica tu sesion y vuelve a intentar.');
  });
});
