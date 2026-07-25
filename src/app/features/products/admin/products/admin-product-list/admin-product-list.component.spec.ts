import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Product } from '../../shared/products-admin.service';
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

  function createComponent(status = 'all') {
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

    return { component };
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
});
