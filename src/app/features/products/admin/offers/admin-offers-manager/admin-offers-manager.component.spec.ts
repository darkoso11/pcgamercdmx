import { of } from 'rxjs';
import { AdminOffersManagerComponent } from './admin-offers-manager.component';

describe('AdminOffersManagerComponent', () => {
  function createComponent(domain: 'products' | 'assemblies') {
    const productsAdminService = {
      getOffersByDomain: jasmine.createSpy('getOffersByDomain').and.returnValue(of([])),
      getAllProducts: jasmine.createSpy('getAllProducts').and.returnValue(of({
        data: [
          {
            _id: 'product-1',
            title: 'GPU',
            category: 'componentes',
            price: 1000,
            stock: 5,
            lowStockAlert: 2,
            published: true,
          },
          {
            _id: 'assembly-1',
            title: 'PC Gamer',
            category: 'paquetes',
            price: 20000,
            stock: 2,
            lowStockAlert: 1,
            published: true,
          },
        ],
        total: 2,
      })),
      createOffer: jasmine.createSpy('createOffer').and.callFake((offer) =>
        of({ _id: 'offer-created', ...offer, createdAt: new Date(), updatedAt: new Date() })
      ),
      updateOffer: jasmine.createSpy('updateOffer').and.callFake((id, offer) =>
        of({ _id: id, ...offer, createdAt: new Date(), updatedAt: new Date() })
      ),
      activateOffer: jasmine.createSpy('activateOffer').and.returnValue(of(undefined)),
      deactivateOffer: jasmine.createSpy('deactivateOffer').and.returnValue(of(undefined)),
    };
    const route = { snapshot: { data: { catalogDomain: domain } } };
    const component = new AdminOffersManagerComponent(
      productsAdminService as any,
      route as any
    );

    return { component, productsAdminService };
  }

  it('loads only offers assigned to the route domain', () => {
    const productContext = createComponent('products');
    const assemblyContext = createComponent('assemblies');

    productContext.component.ngOnInit();
    assemblyContext.component.ngOnInit();

    expect(productContext.productsAdminService.getOffersByDomain).toHaveBeenCalledOnceWith('products', true);
    expect(assemblyContext.productsAdminService.getOffersByDomain).toHaveBeenCalledOnceWith('assemblies', true);
    expect(productContext.component.catalogDomain).toBe('products');
    expect(assemblyContext.component.catalogDomain).toBe('assemblies');
  });

  it('builds an offer form with independent active and badge controls', () => {
    const { component } = createComponent('products');
    const form = (component as any).form;

    expect(form.get('active')?.value).toBeTrue();
    expect(form.get('showBadge')?.value).toBeTrue();
    expect(form.get('discountValue')).toBeTruthy();
    expect(form.get('targetIds')).toBeTruthy();
  });

  it('loads selectable targets only from the current catalog domain', () => {
    const products = createComponent('products');
    const assemblies = createComponent('assemblies');

    products.component.ngOnInit();
    assemblies.component.ngOnInit();

    expect((products.component as any).availableTargets.map((item: any) => item._id))
      .toEqual(['product-1']);
    expect((assemblies.component as any).availableTargets.map((item: any) => item._id))
      .toEqual(['assembly-1']);
  });

  it('creates a product offer with automatic pricing inputs and independent controls', () => {
    const { component, productsAdminService } = createComponent('products');
    component.ngOnInit();
    (component as any).form.patchValue({
      title: 'Semana GPU',
      type: 'percentage',
      discountValue: 15,
      targetIds: ['product-1'],
      startDate: '2026-08-01T00:00',
      endDate: '2026-08-31T23:59',
      active: true,
      showBadge: false,
    });

    (component as any).saveOffer();

    expect(productsAdminService.createOffer).toHaveBeenCalledWith(jasmine.objectContaining({
      catalogDomain: 'products',
      type: 'percentage',
      discountValue: 15,
      applicableTo: {
        products: ['product-1'],
        packages: [],
        categories: [],
      },
      active: true,
      showBadge: false,
    }));
  });
});
