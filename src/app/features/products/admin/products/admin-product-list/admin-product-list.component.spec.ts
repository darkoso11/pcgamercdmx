import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { adminUrl } from '../../../../admin/admin-route.config';
import { AuthService } from '../../../../admin/services/auth.service';
import { Product, ProductsAdminService } from '../../shared/products-admin.service';
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
      updateProduct: jasmine.createSpy('updateProduct').and.callFake((id: string, changes: Partial<Product>) => {
        const source = [
          product('out', 'componentes', 0),
          product('draft', 'perifericos', 8, false),
          product('low', 'componentes', 2),
          product('healthy', 'componentes', 10),
        ].find((item) => item._id === id);
        return of(source ? { ...source, ...changes } : undefined);
      }),
      bulkUpdateProducts: jasmine.createSpy('bulkUpdateProducts').and.callFake((ids: string[]) => of({
        successfulIds: ids,
        failedIds: [],
      })),
      bulkDuplicateProducts: jasmine.createSpy('bulkDuplicateProducts').and.callFake((ids: string[]) => of({
        successfulIds: ids,
        failedIds: [],
      })),
      bulkDeleteProducts: jasmine.createSpy('bulkDeleteProducts').and.callFake((ids: string[]) => of({
        successfulIds: ids,
        failedIds: [],
      })),
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

  it('tracks individual product selection by id', () => {
    const { component } = createComponent();
    component.ngOnInit();

    component.toggleProductSelection('healthy', true);

    expect(component.selectedCount).toBe(1);
    expect(component.isProductSelected('healthy')).toBeTrue();
    expect(component.pageSelectionState).toBe('some');
  });

  it('selects only the current page and keeps that selection while paginating', () => {
    const { component } = createComponent();
    component.ngOnInit();
    component.pageSize = 2;
    component.filterProducts();

    component.toggleCurrentPage(true);
    component.nextPage();

    expect(Array.from(component.selectedProductIds)).toEqual(['draft', 'healthy']);
    expect(component.pageSelectionState).toBe('none');
  });

  it('selects every filtered result explicitly', () => {
    const { component } = createComponent();
    component.ngOnInit();
    component.pageSize = 2;
    component.filterProducts();

    component.selectAllFilteredResults();

    expect(Array.from(component.selectedProductIds)).toEqual(['draft', 'healthy', 'low', 'out']);
  });

  it('clears hidden selections when a filter changes', () => {
    const { component } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('draft', true);
    component.selectedCategory = 'componentes';

    component.onFilterChange();

    expect(component.selectedCount).toBe(0);
    expect(component.filteredProducts.map((item) => item._id)).toEqual(['healthy', 'low', 'out']);
  });

  it('publishes the selected products after confirmation', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('draft', true);

    component.openBulkConfirmation('publish');
    component.confirmBulkAction();

    expect(productsAdminService.bulkUpdateProducts).toHaveBeenCalledOnceWith(
      ['draft'],
      { published: true }
    );
    expect(component.selectedCount).toBe(0);
    expect(component.bulkMessage).toContain('1 producto publicado');
  });

  it('deactivates selected products by changing them to drafts', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);

    component.openBulkConfirmation('deactivate');
    component.confirmBulkAction();

    expect(productsAdminService.bulkUpdateProducts).toHaveBeenCalledOnceWith(
      ['healthy'],
      { published: false }
    );
  });

  it('duplicates selected products through the bulk service', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);

    component.openBulkConfirmation('duplicate');
    component.confirmBulkAction();

    expect(productsAdminService.bulkDuplicateProducts).toHaveBeenCalledOnceWith(['healthy']);
  });

  it('applies a percentage price change without producing negative prices', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.bulkPriceMode = 'percentage';
    component.bulkPriceValue = -150;

    component.applyBulkPrice();

    const changesForProduct = productsAdminService.bulkUpdateProducts.calls.mostRecent().args[1];
    expect(changesForProduct('healthy')).toEqual({ price: 0 });
  });

  it('sets the same fixed price on every selected product', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.bulkPriceMode = 'set';
    component.bulkPriceValue = 249.99;

    component.applyBulkPrice();

    const changesForProduct = productsAdminService.bulkUpdateProducts.calls.mostRecent().args[1];
    expect(changesForProduct('healthy')).toEqual({ price: 249.99 });
  });

  it('reduces stock without producing a negative quantity', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.bulkStockMode = 'decrease';
    component.bulkStockValue = 25;

    component.applyBulkStock();

    const changesForProduct = productsAdminService.bulkUpdateProducts.calls.mostRecent().args[1];
    expect(changesForProduct('healthy')).toEqual({ stock: 0 });
  });

  it('rejects fractional stock quantities', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.bulkStockValue = 2.5;

    component.applyBulkStock();

    expect(productsAdminService.bulkUpdateProducts).not.toHaveBeenCalled();
    expect(component.bulkMessage).toContain('entera');
  });

  it('updates the low-stock alert with a non-negative integer', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.bulkLowStockAlert = 7;

    component.applyBulkLowStockAlert();

    expect(productsAdminService.bulkUpdateProducts).toHaveBeenCalledOnceWith(
      ['healthy'],
      { lowStockAlert: 7 }
    );
  });

  it('rejects a fractional low-stock alert', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.bulkLowStockAlert = 1.5;

    component.applyBulkLowStockAlert();

    expect(productsAdminService.bulkUpdateProducts).not.toHaveBeenCalled();
    expect(component.bulkMessage).toContain('entera');
  });

  it('rejects a subcategory that does not belong to the selected category', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.categories = [{
      _id: '2',
      name: 'Componentes',
      slug: 'componentes',
      order: 2,
      subcategories: [{ _id: 'cpu', name: 'Procesadores', slug: 'procesadores' }],
    }];
    component.toggleProductSelection('healthy', true);
    component.bulkCategory = 'componentes';
    component.bulkSubcategoryId = 'keyboard';

    component.applyBulkCategory();

    expect(productsAdminService.bulkUpdateProducts).not.toHaveBeenCalled();
    expect(component.bulkMessage).toContain('subcategoría válida');
  });

  it('updates category and a compatible subcategory together', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.categories = [{
      _id: '2',
      name: 'Componentes',
      slug: 'componentes',
      order: 2,
      subcategories: [{ _id: 'cpu', name: 'Procesadores', slug: 'procesadores' }],
    }];
    component.toggleProductSelection('healthy', true);
    component.bulkCategory = 'componentes';
    component.bulkSubcategoryId = 'cpu';

    component.applyBulkCategory();

    expect(productsAdminService.bulkUpdateProducts).toHaveBeenCalledOnceWith(
      ['healthy'],
      { category: 'componentes', categoryId: '2', subcategoryId: 'cpu' }
    );
  });

  it('rejects moving catalog products into the assemblies category', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.categories = [{
      _id: '1',
      name: 'Ensambles',
      slug: 'ensambles',
      order: 1,
      subcategories: [{ _id: 'gaming', name: 'Gaming', slug: 'gaming' }],
    }];
    component.toggleProductSelection('healthy', true);
    component.bulkCategory = 'paquetes';
    component.bulkSubcategoryId = 'gaming';

    component.applyBulkCategory();

    expect(productsAdminService.bulkUpdateProducts).not.toHaveBeenCalled();
    expect(component.bulkMessage).toContain('categoría válida');
  });

  it('does not delete products when the controlled confirmation is cancelled', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);

    component.openBulkConfirmation('delete');
    component.cancelBulkAction();

    expect(productsAdminService.bulkDeleteProducts).not.toHaveBeenCalled();
    expect(component.pendingBulkAction).toBeNull();
  });

  it('deletes selected products after controlled confirmation', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);

    component.openBulkConfirmation('delete');
    component.confirmBulkAction();

    expect(productsAdminService.bulkDeleteProducts).toHaveBeenCalledOnceWith(['healthy']);
  });

  it('keeps failed products selected after a partial bulk result', () => {
    const { component, productsAdminService } = createComponent();
    productsAdminService.bulkUpdateProducts.and.returnValue(of({
      successfulIds: ['healthy'],
      failedIds: ['low'],
    }));
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.toggleProductSelection('low', true);

    component.openBulkConfirmation('deactivate');
    component.confirmBulkAction();

    expect(Array.from(component.selectedProductIds)).toEqual(['low']);
    expect(component.bulkMessage).toContain('1 correcto y 1 con error');
  });

  it('blocks another confirmation while a bulk action is in progress', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.toggleProductSelection('healthy', true);
    component.openBulkConfirmation('publish');
    component.bulkActionInProgress = true;

    component.confirmBulkAction();

    expect(productsAdminService.bulkUpdateProducts).not.toHaveBeenCalled();
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

  it('initializes an independent quick-edit draft for every listed product', () => {
    const { component } = createComponent();

    component.ngOnInit();

    expect(component.getQuickEditDraft('healthy').original).toEqual({
      price: 100,
      stock: 10,
      published: true,
    });
    expect(component.isQuickEditDirty('healthy')).toBeFalse();
  });

  it('saves only changed quick-edit fields and confirms the returned product', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    const draft = component.getQuickEditDraft('healthy');
    draft.stock = 4;
    draft.published = false;

    component.saveQuickEdit('healthy');

    expect(productsAdminService.updateProduct).toHaveBeenCalledOnceWith('healthy', {
      stock: 4,
      published: false,
    });
    expect(component.products.find((item) => item._id === 'healthy')?.stock).toBe(4);
    expect(component.getQuickEditDraft('healthy').message).toBe('Cambios guardados.');
    expect(component.isQuickEditDirty('healthy')).toBeFalse();
  });

  it('keeps an invalid quick-edit draft without calling the service', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').stock = 1.5;

    component.saveQuickEdit('healthy');

    expect(productsAdminService.updateProduct).not.toHaveBeenCalled();
    expect(component.getQuickEditDraft('healthy').errors.stock).toContain('entera');
  });

  it('keeps changed values available for retry when a quick save fails', () => {
    const { component, productsAdminService } = createComponent();
    productsAdminService.updateProduct.and.returnValue(throwError(() => new Error('network')));
    component.ngOnInit();
    component.getQuickEditDraft('healthy').price = 125;

    component.saveQuickEdit('healthy');

    expect(component.getQuickEditDraft('healthy').price).toBe(125);
    expect(component.getQuickEditDraft('healthy').message).toBe(
      'No se pudieron guardar los cambios. Intenta de nuevo.'
    );
    expect(component.isQuickEditDirty('healthy')).toBeTrue();
  });

  it('discards quick-edit changes for only the requested row', () => {
    const { component } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').price = 125;
    component.getQuickEditDraft('low').stock = 1;

    component.discardQuickEdit('healthy');

    expect(component.getQuickEditDraft('healthy').price).toBe(100);
    expect(component.getQuickEditDraft('low').stock).toBe(1);
  });

  it('uses Enter to save and Escape to discard the focused row', () => {
    const { component, productsAdminService } = createComponent();
    component.ngOnInit();
    component.getQuickEditDraft('healthy').price = 125;
    const enter = new KeyboardEvent('keydown', { key: 'Enter' });
    const escape = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(enter, 'preventDefault');
    spyOn(escape, 'preventDefault');

    component.handleQuickEditKeydown(enter, 'healthy');
    component.getQuickEditDraft('low').stock = 1;
    component.handleQuickEditKeydown(escape, 'low');

    expect(productsAdminService.updateProduct).toHaveBeenCalledOnceWith('healthy', { price: 125 });
    expect(component.getQuickEditDraft('low').stock).toBe(2);
    expect(enter.preventDefault).toHaveBeenCalled();
    expect(escape.preventDefault).toHaveBeenCalled();
  });

  it('reapplies the active status filter after a quick save', () => {
    const { component } = createComponent('published');
    component.ngOnInit();
    component.getQuickEditDraft('healthy').published = false;

    component.saveQuickEdit('healthy');

    expect(component.filteredProducts.map((item) => item._id)).not.toContain('healthy');
  });

  it('renders accessible quick-edit controls and keeps bulk actions available', () => {
    TestBed.configureTestingModule({
      imports: [AdminProductListComponent],
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
            getAllProducts: () => of({ data: [product('healthy', 'componentes', 10)], total: 1 }),
            getAllCategories: () => of([]),
            updateProduct: () => of(product('healthy', 'componentes', 10)),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdminProductListComponent);

    fixture.detectChanges();
    fixture.componentInstance.toggleProductSelection('healthy', true);
    fixture.detectChanges();

    const priceInput = fixture.debugElement.query(By.css('[data-testid="quick-edit-price-healthy"]'));
    const stockInput = fixture.debugElement.query(By.css('[data-testid="quick-edit-stock-healthy"]'));
    const publishedInput = fixture.debugElement.query(By.css('[data-testid="quick-edit-published-healthy"]'));
    expect(priceInput.attributes['aria-label']).toContain('healthy');
    expect(stockInput.attributes['aria-label']).toContain('healthy');
    expect(publishedInput.attributes['aria-label']).toContain('healthy');
    expect(fixture.nativeElement.textContent).toContain('Publicar');
    expect(fixture.nativeElement.textContent).toContain('Desactivar');
  });
});
