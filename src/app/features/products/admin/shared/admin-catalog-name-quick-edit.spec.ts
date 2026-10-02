import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { AuthService } from '../../../admin/services/auth.service';
import { AdminProductsDashboardComponent } from '../dashboard/admin-products-dashboard/admin-products-dashboard.component';
import { AdminAssembliesDashboardComponent } from '../dashboard/admin-assemblies-dashboard/admin-assemblies-dashboard.component';
import { AdminProductListComponent } from '../products/admin-product-list/admin-product-list.component';
import { AdminAssembliesListComponent } from '../assemblies/admin-assemblies-list/admin-assemblies-list.component';
import { CatalogQuickEditDraft } from './admin-catalog-quick-edit.utils';
import { Product, ProductsAdminService } from './products-admin.service';

interface NameEditor {
  getQuickEditDraft(id: string): CatalogQuickEditDraft;
  isQuickEditDirty(id: string): boolean;
}

const editors: { component: Type<NameEditor>; category: Product['category'] }[] = [
  { component: AdminProductsDashboardComponent, category: 'componentes' },
  { component: AdminAssembliesDashboardComponent, category: 'paquetes' },
  { component: AdminProductListComponent, category: 'componentes' },
  { component: AdminAssembliesListComponent, category: 'paquetes' },
];

for (const { component, category } of editors) {
  describe(`${component.name} quick name editing`, () => {
    let fixture: ComponentFixture<NameEditor>;
    let pendingSave: Subject<Product>;
    let updateProduct: jasmine.Spy;
    let item: Product;

    beforeEach(async () => {
      item = {
        _id: 'item', title: 'Nombre original', slug: 'url-original', category,
        description: 'Descripción conservada', price: 100, stock: 10, lowStockAlert: 3,
        published: true, image: '', images: [], brandLogos: [],
        createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
      };
      pendingSave = new Subject<Product>();
      updateProduct = jasmine.createSpy('updateProduct').and.returnValue(pendingSave);
      TestBed.configureTestingModule({
        imports: [component],
        providers: [
          provideRouter([]),
          { provide: AuthService, useValue: { logout: () => undefined } },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({}) } } },
          {
            provide: ProductsAdminService,
            useValue: {
              getAllProducts: () => of({ data: [item], total: 1 }),
              getProductsByCategory: () => of([item]),
              getAllCategories: () => of([]),
              getCatalogDashboardStats: () => of({
                total: 1, published: 1, draft: 0, lowStock: 0, outOfStock: 0,
                totalOffers: 0, activeOffers: 0,
              }),
              updateProduct,
            },
          },
        ],
      });
      fixture = TestBed.createComponent(component);
      await stabilize();
    });

    async function stabilize() {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }

    function input(layout: string): HTMLInputElement {
      const element = fixture.nativeElement.querySelector(`[data-testid="quick-edit-title-${layout}-item"]`);
      expect(element).withContext(`name input in ${layout}`).not.toBeNull();
      return element;
    }

    async function typeName(layout: string, value: string) {
      const element = input(layout);
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      await stabilize();
    }

    async function key(layout: string, value: string) {
      input(layout).dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }));
      await stabilize();
    }

    for (const layout of ['desktop', 'mobile']) {
      it(`renders a populated accessible name input in ${layout}`, () => {
        const element = input(layout);
        expect(element.value).toBe(item.title);
        expect(element.getAttribute('aria-label')).toBe(`Nombre de ${item.title}`);
        expect(element.getAttribute('aria-invalid')).toBe('false');
      });

      it(`saves a trimmed name with Enter in ${layout}, locking both layouts until confirmation`, async () => {
        await typeName(layout, '  Nombre nuevo  ');
        expect(item.title).toBe('Nombre original');
        expect(fixture.componentInstance.isQuickEditDirty('item')).toBeTrue();
        await key(layout, 'Enter');
        expect(updateProduct).toHaveBeenCalledOnceWith('item', { title: 'Nombre nuevo' });
        expect(input('desktop').disabled).toBeTrue();
        expect(input('mobile').disabled).toBeTrue();
        pendingSave.next({ ...item, title: 'Nombre nuevo' });
        pendingSave.complete();
        await stabilize();
        expect(input('desktop').value).toBe('Nombre nuevo');
        expect(input('mobile').value).toBe('Nombre nuevo');
        expect(input(layout).disabled).toBeFalse();
        expect(fixture.componentInstance.isQuickEditDirty('item')).toBeFalse();
        expect(fixture.nativeElement.textContent).toContain('Cambios guardados.');
        expect(fixture.nativeElement.textContent).toContain('url-original');
      });

      it(`rejects whitespace names with an associated error in ${layout}`, async () => {
        await typeName(layout, '   ');
        await key(layout, 'Enter');
        expect(updateProduct).not.toHaveBeenCalled();
        const element = input(layout);
        expect(element.getAttribute('aria-invalid')).toBe('true');
        const errorId = element.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        const error = fixture.nativeElement.querySelector(`[id="${errorId}"]`);
        expect(error?.textContent).toContain('Ingresa un nombre válido.');
        await typeName(layout, 'Nombre válido');
        expect(input(layout).getAttribute('aria-invalid')).toBe('false');
      });

      it(`discards the name with Escape in ${layout}`, async () => {
        await typeName(layout, 'Nombre temporal');
        await key(layout, 'Escape');
        expect(input(layout).value).toBe(item.title);
        expect(fixture.componentInstance.isQuickEditDirty('item')).toBeFalse();
        expect(updateProduct).not.toHaveBeenCalled();
      });

      it(`preserves the name after a failed save and retries in ${layout}`, async () => {
        await typeName(layout, 'Nombre pendiente');
        await key(layout, 'Enter');
        pendingSave.error(new Error('network'));
        await stabilize();
        expect(input(layout).value).toBe('Nombre pendiente');
        expect(input(layout).disabled).toBeFalse();
        expect(fixture.componentInstance.isQuickEditDirty('item')).toBeTrue();
        expect(fixture.nativeElement.textContent).toContain('No se pudieron guardar');
        updateProduct.and.returnValue(of({ ...item, title: 'Nombre pendiente' }));
        await key(layout, 'Enter');
        expect(updateProduct).toHaveBeenCalledTimes(2);
        expect(fixture.componentInstance.isQuickEditDirty('item')).toBeFalse();
      });
    }

    it('keeps the pending name when changing filters away and back', async () => {
      await typeName('desktop', 'Nombre pendiente');
      const editor = fixture.componentInstance;
      for (const status of ['draft', 'all'] as const) {
        if (editor instanceof AdminProductsDashboardComponent || editor instanceof AdminAssembliesDashboardComponent) {
          editor.goToStatus(status);
        } else if (editor instanceof AdminProductListComponent) {
          editor.selectedStatus = status;
          editor.onFilterChange();
        } else if (editor instanceof AdminAssembliesListComponent) {
          editor.selectedStatus = status;
          editor.filterAssemblies();
        }
        await stabilize();
      }
      expect(input('desktop').value).toBe('Nombre pendiente');
      expect(input('mobile').value).toBe('Nombre pendiente');
      expect(updateProduct).not.toHaveBeenCalled();
    });
  });
}
