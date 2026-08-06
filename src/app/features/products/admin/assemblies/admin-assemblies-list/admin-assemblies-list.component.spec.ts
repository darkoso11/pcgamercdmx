import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AuthService } from '../../../../admin/services/auth.service';
import { Product } from '../../shared/products-admin.service';
import { ProductsAdminService } from '../../shared/products-admin.service';
import { AdminAssemblyCardComponent } from '../shared/admin-assembly-card/admin-assembly-card.component';
import { AdminAssembliesListComponent } from './admin-assemblies-list.component';

describe('AdminAssembliesListComponent', () => {
  const assembly = (
    id: string,
    stock: number,
    published = true
  ): Product => ({
    _id: id,
    title: id,
    slug: id,
    description: id,
    category: 'paquetes',
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

  function createComponent(deleteResult = of(true), status = 'all') {
    const productsAdminService = {
      getProductsByCategory: jasmine.createSpy('getProductsByCategory').and.returnValue(of([
        assembly('out', 0),
        assembly('draft', 10, false),
        assembly('low', 2),
        assembly('healthy', 10),
      ])),
      duplicateProduct: jasmine.createSpy('duplicateProduct').and.returnValue(of(undefined)),
      deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(deleteResult),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const route = { snapshot: { queryParamMap: convertToParamMap({ status }) } };

    const component = new AdminAssembliesListComponent(
      productsAdminService as any,
      router as any,
      cdr as any,
      route as any
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

  it('applies a draft filter from the URL', () => {
    const { component } = createComponent(of(true), 'draft');

    component.ngOnInit();

    expect(component.filteredAssemblies.map((item) => item._id)).toEqual(['draft']);
    expect(component.selectedStatus).toBe('draft');
  });

  it('uses the stock cascade for the unfiltered list', () => {
    const { component } = createComponent();

    component.ngOnInit();

    expect(component.filteredAssemblies.map((item) => item._id)).toEqual([
      'draft',
      'healthy',
      'low',
      'out',
    ]);
  });

  it('renders the complete list with shared management cards', () => {
    TestBed.configureTestingModule({
      imports: [AdminAssembliesListComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { logout: () => undefined } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
        {
          provide: ProductsAdminService,
          useValue: {
            getProductsByCategory: () => of([assembly('robot', 6)]),
            duplicateProduct: () => of(undefined),
            deleteProduct: () => of(true),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdminAssembliesListComponent);

    fixture.detectChanges();

    const card = fixture.debugElement.query(By.directive(AdminAssemblyCardComponent));
    expect(card).not.toBeNull();
    expect(card.componentInstance.managementMode).toBeTrue();
  });
});
