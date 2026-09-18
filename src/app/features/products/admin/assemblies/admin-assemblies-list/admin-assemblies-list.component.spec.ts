import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AuthService } from '../../../../admin/services/auth.service';
import { Product } from '../../shared/products-admin.service';
import { ProductsAdminService } from '../../shared/products-admin.service';
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
      updateProduct: jasmine.createSpy('updateProduct').and.callFake((id: string, changes: Partial<Product>) => {
        const source = [
          assembly('out', 0),
          assembly('draft', 10, false),
          assembly('low', 2),
          assembly('healthy', 10),
        ].find((item) => item._id === id);
        return of(source ? { ...source, ...changes } : undefined);
      }),
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

  it('renders the complete list as accessible quick-edit rows', () => {
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
            updateProduct: () => of(assembly('robot', 6)),
            duplicateProduct: () => of(undefined),
            deleteProduct: () => of(true),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdminAssembliesListComponent);

    fixture.detectChanges();

    const priceInput = fixture.debugElement.query(By.css('[data-testid="quick-edit-price-robot"]'));
    const stockInput = fixture.debugElement.query(By.css('[data-testid="quick-edit-stock-robot"]'));
    const publishedInput = fixture.debugElement.query(By.css('[data-testid="quick-edit-published-robot"]'));
    expect(priceInput.attributes['aria-label']).toContain('robot');
    expect(stockInput.attributes['aria-label']).toContain('robot');
    expect(publishedInput.attributes['aria-label']).toContain('robot');
    expect(fixture.nativeElement.textContent).toContain('Duplicar');
    expect(fixture.nativeElement.textContent).toContain('Eliminar');
  });

  it('initializes quick-edit drafts for assemblies', () => {
    const { component } = createComponent();

    component.ngOnInit();

    expect(component.getQuickEditDraft('healthy').original).toEqual({
      price: 100,
      stock: 10,
      published: true,
    });
    expect(component.isQuickEditDirty('healthy')).toBeFalse();
  });

  it('saves only changed assembly fields and confirms the returned values', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').price = 125;

    component.saveQuickEdit('healthy');

    expect(productsAdminService.updateProduct).toHaveBeenCalledOnceWith('healthy', { price: 125 });
    expect(component.assemblies.find((item) => item._id === 'healthy')?.price).toBe(125);
    expect(component.getQuickEditDraft('healthy').message).toBe('Cambios guardados.');
    expect(component.isQuickEditDirty('healthy')).toBeFalse();
  });

  it('keeps an invalid assembly draft without calling the service', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').stock = -1;

    component.saveQuickEdit('healthy');

    expect(productsAdminService.updateProduct).not.toHaveBeenCalled();
    expect(component.getQuickEditDraft('healthy').errors.stock).toContain('entera');
  });

  it('keeps assembly edits available for retry after an error', () => {
    const { component, productsAdminService } = createComponent();
    productsAdminService.updateProduct.and.returnValue(throwError(() => new Error('network')));
    component.ngOnInit();
    component.getQuickEditDraft('healthy').published = false;

    component.saveQuickEdit('healthy');

    expect(component.getQuickEditDraft('healthy').published).toBeFalse();
    expect(component.getQuickEditDraft('healthy').message).toContain('No se pudieron guardar');
    expect(component.isQuickEditDirty('healthy')).toBeTrue();
  });

  it('discards one assembly row without changing another draft', () => {
    const { component } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').stock = 4;
    component.getQuickEditDraft('low').stock = 1;

    component.discardQuickEdit('healthy');

    expect(component.getQuickEditDraft('healthy').stock).toBe(10);
    expect(component.getQuickEditDraft('low').stock).toBe(1);
  });

  it('uses keyboard shortcuts on the focused assembly row', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').stock = 5;
    const enter = new KeyboardEvent('keydown', { key: 'Enter' });
    const escape = new KeyboardEvent('keydown', { key: 'Escape' });

    component.handleQuickEditKeydown(enter, 'healthy');
    component.getQuickEditDraft('low').stock = 1;
    component.handleQuickEditKeydown(escape, 'low');

    expect(productsAdminService.updateProduct).toHaveBeenCalledOnceWith('healthy', { stock: 5 });
    expect(component.getQuickEditDraft('low').stock).toBe(2);
  });
});
