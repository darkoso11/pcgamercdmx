import { of, Subject } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Product, ProductsAdminService } from '../../shared/products-admin.service';
import { AdminProductsDashboardComponent } from './admin-products-dashboard.component';

describe('AdminProductsDashboardComponent', () => {
  const product = (id: string, overrides: Partial<Product> = {}): Product => ({
    _id: id,
    title: id,
    slug: id,
    description: id,
    category: 'componentes',
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

  function createComponent(products: Product[] = []) {
    const productsAdminService = {
      getCatalogDashboardStats: jasmine.createSpy('getCatalogDashboardStats').and.returnValue(of({
        total: 4,
        published: 3,
        draft: 1,
        lowStock: 1,
        outOfStock: 1,
        totalOffers: 2,
        activeOffers: 1,
      })),
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of({ data: products })),
      getAllCategories: jasmine.createSpy('getAllCategories').and.returnValue(of([])),
      updateProduct: jasmine.createSpy('updateProduct'),
      duplicateProduct: jasmine.createSpy('duplicateProduct').and.returnValue(of(undefined)),
      deleteProduct: jasmine.createSpy('deleteProduct').and.returnValue(of(true)),
    };
    const router = { navigate: jasmine.createSpy('navigate') };
    const cdr = { detectChanges: jasmine.createSpy('detectChanges') };
    const component = new AdminProductsDashboardComponent(
      productsAdminService as any,
      router as any,
      cdr as any
    );

    return { component, productsAdminService, router };
  }

  it('loads only product dashboard data', () => {
    const { component, productsAdminService } = createComponent();

    component.ngOnInit();

    expect(productsAdminService.getCatalogDashboardStats).toHaveBeenCalledOnceWith('products');
    expect(productsAdminService.getAllProducts).toHaveBeenCalled();
    expect(productsAdminService.getAllCategories).toHaveBeenCalled();
    expect(component.stats?.draft).toBe(1);
  });

  it('starts with the 20 most recently created products', () => {
    const products = Array.from({ length: 22 }, (_, index) => product(`product-${index}`, {
      createdAt: new Date(2026, 0, index + 1),
    }));
    const { component } = createComponent(products);

    component.ngOnInit();

    expect(component.selectedView).toBe('recent');
    expect(component.visibleProducts).toHaveSize(20);
    expect(component.visibleProducts[0]._id).toBe('product-21');
  });

  it('keeps another row draft when duplication reloads the dashboard', () => {
    const { component, productsAdminService } = createComponent([product('a'), product('b')]);
    component.ngOnInit();
    component.getQuickEditDraft('a').price = 125;
    productsAdminService.duplicateProduct.and.returnValue(of(product('copy')));
    component.duplicateProduct('b');
    expect(component.getQuickEditDraft('a').price).toBe(125);
    expect(component.isQuickEditDirty('a')).toBeTrue();
  });

  it('filters inside the dashboard without router navigation', () => {
    const { component, router } = createComponent([
      product('published'),
      product('draft', { published: false }),
    ]);
    component.ngOnInit();

    component.goToStatus('draft');

    expect(component.selectedView).toBe('draft');
    expect(component.visibleProducts.map((item) => item._id)).toEqual(['draft']);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('saves only changed quick-edit fields and confirms the returned product', () => {
    const original = product('product');
    const saved = product('product', { price: 125 });
    const { component, productsAdminService } = createComponent([original]);
    productsAdminService.updateProduct.and.returnValue(of(saved));
    component.ngOnInit();

    component.getQuickEditDraft('product').price = 125;
    component.saveQuickEdit('product');

    expect(productsAdminService.updateProduct).toHaveBeenCalledOnceWith('product', { price: 125 });
    expect(component.products[0].price).toBe(125);
    expect(component.getQuickEditDraft('product').message).toBe('Cambios guardados.');
    expect(productsAdminService.getCatalogDashboardStats).toHaveBeenCalledTimes(2);
  });

  it('discards quick-edit changes for one product', () => {
    const { component } = createComponent([product('product')]);
    component.ngOnInit();
    component.getQuickEditDraft('product').stock = 2;

    component.discardQuickEdit('product');

    expect(component.getQuickEditDraft('product').stock).toBe(10);
  });

  it('duplicates a product and reloads the dashboard rows', () => {
    const { component, productsAdminService } = createComponent([product('product')]);
    productsAdminService.duplicateProduct.and.returnValue(of(product('copy')));
    component.ngOnInit();

    component.duplicateProduct('product');

    expect(productsAdminService.duplicateProduct).toHaveBeenCalledOnceWith('product');
    expect(productsAdminService.getAllProducts).toHaveBeenCalledTimes(2);
  });

  it('deletes a confirmed product and reloads the dashboard rows', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const { component, productsAdminService } = createComponent([product('product')]);
    component.ngOnInit();

    component.deleteProduct('product');

    expect(productsAdminService.deleteProduct).toHaveBeenCalledOnceWith('product');
    expect(productsAdminService.getAllProducts).toHaveBeenCalledTimes(2);
  });

  it('renders quick-edit controls and detailed actions in the dashboard row', () => {
    const pendingSave = new Subject<Product>();
    TestBed.configureTestingModule({
      imports: [AdminProductsDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsAdminService,
          useValue: {
            getCatalogDashboardStats: () => of({ total: 1 }),
            getAllCategories: () => of([]),
            getAllProducts: () => of({ data: [product('product')] }),
            updateProduct: () => pendingSave,
            duplicateProduct: () => of(product('copy')),
            deleteProduct: () => of(true),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdminProductsDashboardComponent);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="dashboard-quick-edit-price-product"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="dashboard-quick-edit-stock-product"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="dashboard-quick-edit-published-product"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Editar detalles de product"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Duplicar product"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[aria-label="Eliminar product"]'))).not.toBeNull();

    fixture.componentInstance.getQuickEditDraft('product').price = 125;
    fixture.componentInstance.saveQuickEdit('product');
    fixture.detectChanges();
    expect(fixture.componentInstance.getQuickEditDraft('product').saving).toBeTrue();
    pendingSave.next(product('product', { price: 125 }));
    pendingSave.complete();
    fixture.detectChanges();
    expect(fixture.componentInstance.getQuickEditDraft('product').price).toBe(125);
  });

  it('shows the selected subcategory instead of a generic category label', () => {
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
});
