import { of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Product, ProductsAdminService } from '../../shared/products-admin.service';
import { AdminAssembliesDashboardComponent } from './admin-assemblies-dashboard.component';

describe('AdminAssembliesDashboardComponent', () => {
  const assembly = (id: string, overrides: Partial<Product> = {}): Product => ({
    _id: id,
    title: id,
    slug: id,
    description: id,
    category: 'paquetes',
    price: 100,
    image: '',
    images: [],
    brandLogos: [],
    stock: 10,
    lowStockAlert: 3,
    published: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  });

  function createComponent(assemblies: Product[] = []) {
    const productsAdminService = {
      getCatalogDashboardStats: jasmine.createSpy('getCatalogDashboardStats').and.returnValue(of({
        total: 5,
        published: 4,
        draft: 1,
        lowStock: 2,
        outOfStock: 1,
        totalOffers: 1,
        activeOffers: 1,
      })),
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of({ data: assemblies })),
      updateProduct: jasmine.createSpy('updateProduct'),
      duplicateProduct: jasmine.createSpy('duplicateProduct').and.returnValue(of(undefined)),
      deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(of(true)),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const component = new AdminAssembliesDashboardComponent(
      productsAdminService as any,
      router as any,
      cdr as any
    );

    return { component, productsAdminService, router };
  }

  it('loads only assembly dashboard data', () => {
    const { component, productsAdminService } = createComponent();

    component.ngOnInit();

    expect(productsAdminService.getCatalogDashboardStats).toHaveBeenCalledOnceWith('assemblies');
    expect(productsAdminService.getAllProducts).toHaveBeenCalled();
    expect(component.stats?.draft).toBe(1);
  });

  it('starts with the 20 most recently created assemblies', () => {
    const assemblies = Array.from({ length: 22 }, (_, index) => assembly(`assembly-${index}`, {
      createdAt: new Date(2026, 0, index + 1),
    }));
    const { component } = createComponent(assemblies);

    component.ngOnInit();

    expect(component.selectedView).toBe('recent');
    expect(component.visibleAssemblies).toHaveSize(20);
    expect(component.visibleAssemblies[0]._id).toBe('assembly-21');
  });

  it('keeps another row draft when duplication reloads the dashboard', () => {
    const { component, productsAdminService } = createComponent([assembly('a'), assembly('b')]);
    component.ngOnInit();
    component.getQuickEditDraft('a').price = 125;
    productsAdminService.duplicateProduct.and.returnValue(of(assembly('copy')));
    component.duplicateAssembly('b');
    expect(component.getQuickEditDraft('a').price).toBe(125);
    expect(component.isQuickEditDirty('a')).toBeTrue();
  });

  it('filters inside the dashboard without router navigation', () => {
    const { component, router } = createComponent([
      assembly('published'),
      assembly('out', { stock: 0 }),
    ]);
    component.ngOnInit();

    component.goToStatus('out-of-stock');

    expect(component.selectedView).toBe('out-of-stock');
    expect(component.visibleAssemblies.map((item) => item._id)).toEqual(['out']);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('saves only changed quick-edit fields and confirms the returned assembly', () => {
    const original = assembly('assembly');
    const saved = assembly('assembly', { stock: 4 });
    const { component, productsAdminService } = createComponent([original]);
    productsAdminService.updateProduct.and.returnValue(of(saved));
    component.ngOnInit();

    component.getQuickEditDraft('assembly').stock = 4;
    component.saveQuickEdit('assembly');

    expect(productsAdminService.updateProduct).toHaveBeenCalledOnceWith('assembly', { stock: 4 });
    expect(component.assemblies[0].stock).toBe(4);
    expect(component.getQuickEditDraft('assembly').message).toBe('Cambios guardados.');
    expect(productsAdminService.getCatalogDashboardStats).toHaveBeenCalledTimes(2);
  });

  it('duplicates an assembly and reloads the dashboard rows', () => {
    const { component, productsAdminService } = createComponent([assembly('assembly')]);
    productsAdminService.duplicateProduct.and.returnValue(of(assembly('copy')));
    component.ngOnInit();

    component.duplicateAssembly('assembly');

    expect(productsAdminService.duplicateProduct).toHaveBeenCalledOnceWith('assembly');
    expect(productsAdminService.getAllProducts).toHaveBeenCalledTimes(2);
  });

  it('deletes a confirmed assembly and reloads the dashboard rows', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { component, productsAdminService } = createComponent([assembly('assembly')]);
    component.ngOnInit();

    component.deleteAssembly('assembly');

    expect(productsAdminService.deleteProduct).toHaveBeenCalledOnceWith('assembly');
    expect(productsAdminService.getAllProducts).toHaveBeenCalledTimes(2);
  });

  it('renders quick-edit controls and detailed actions in the dashboard row', () => {
    const pendingSave = new Subject<Product>();
    TestBed.configureTestingModule({
      imports: [AdminAssembliesDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsAdminService,
          useValue: {
            getCatalogDashboardStats: () => of({ total: 1 }),
            getAllProducts: () => of({ data: [assembly('assembly')] }),
            updateProduct: () => pendingSave,
            duplicateProduct: () => of(assembly('copy')),
            deleteProduct: () => of(true),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdminAssembliesDashboardComponent);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="dashboard-quick-edit-price-assembly"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="dashboard-quick-edit-stock-assembly"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="dashboard-quick-edit-published-assembly"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Editar detalles de assembly"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Duplicar assembly"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Eliminar assembly"]'))).not.toBeNull();

    fixture.componentInstance.getQuickEditDraft('assembly').price = 125;
    fixture.componentInstance.saveQuickEdit('assembly');
    fixture.detectChanges();
    expect(fixture.componentInstance.getQuickEditDraft('assembly').saving).toBeTrue();
    pendingSave.next(assembly('assembly', { price: 125 }));
    pendingSave.complete();
    fixture.detectChanges();
    expect(fixture.componentInstance.getQuickEditDraft('assembly').price).toBe(125);
  });
});
