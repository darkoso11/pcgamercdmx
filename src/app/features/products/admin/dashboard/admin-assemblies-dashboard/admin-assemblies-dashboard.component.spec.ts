import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { adminUrl } from '../../../../admin/admin-route.config';
import { AdminAssemblyCardComponent } from '../../assemblies/shared/admin-assembly-card/admin-assembly-card.component';
import { ProductsAdminService } from '../../shared/products-admin.service';
import { AdminAssembliesDashboardComponent } from './admin-assemblies-dashboard.component';

describe('AdminAssembliesDashboardComponent', () => {
  function createComponent() {
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
      getRecentCatalogItems: jasmine.createSpy('getRecentCatalogItems').and.returnValue(of([])),
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
    expect(productsAdminService.getRecentCatalogItems).toHaveBeenCalledOnceWith('assemblies', 5);
    expect(component.stats?.draft).toBe(1);
  });

  it('opens the assembly list with the selected metric filter', () => {
    const { component, router } = createComponent();

    component.goToStatus('out-of-stock');

    expect(router.navigate).toHaveBeenCalledOnceWith(
      [adminUrl('assemblies/list')],
      { queryParams: { status: 'out-of-stock' } }
    );
  });

  it('renders recent assemblies with the shared visual card', () => {
    TestBed.configureTestingModule({
      imports: [AdminAssembliesDashboardComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductsAdminService,
          useValue: {
            getCatalogDashboardStats: () => of({ total: 1 }),
            getRecentCatalogItems: () => of([{
              _id: 'robot', title: 'ROBOT', slug: 'robot', description: '', category: 'paquetes',
              price: 100, image: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
              images: [], brandLogos: [], stock: 1, lowStockAlert: 2, published: true,
              createdAt: new Date(), updatedAt: new Date(),
            }]),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(AdminAssembliesDashboardComponent);

    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(AdminAssemblyCardComponent))).not.toBeNull();
  });
});
