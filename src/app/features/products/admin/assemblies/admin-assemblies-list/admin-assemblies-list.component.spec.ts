import { of } from 'rxjs';
import { AdminAssembliesListComponent } from './admin-assemblies-list.component';

describe('AdminAssembliesListComponent', () => {
  function createComponent(deleteResult = of(true)) {
    const productsAdminService = {
      getProductsByCategory: jasmine.createSpy('getProductsByCategory').and.returnValue(of([])),
      duplicateProduct: jasmine.createSpy('duplicateProduct').and.returnValue(of(undefined)),
      deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(deleteResult),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };

    const component = new AdminAssembliesListComponent(
      productsAdminService as any,
      router as any,
      cdr as any
    );

    return { component, productsAdminService };
  }

  it('does not reload assemblies when delete service reports failure', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { component, productsAdminService } = createComponent(of(false));

    component.deleteAssembly('123');

    expect(productsAdminService.deleteProduct).toHaveBeenCalledOnceWith('123');
    expect(productsAdminService.getProductsByCategory).not.toHaveBeenCalled();
    expect((component as any).errorMessage).toBe('No se pudo eliminar el ensamble. Intenta de nuevo.');
  });
});
