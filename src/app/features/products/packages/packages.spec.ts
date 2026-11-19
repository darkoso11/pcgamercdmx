import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Packages } from './packages';
import { ProductsService } from '../services/products.service';
import { AssembledPC, PerformanceTier, ProductCategory, ProductStatus, UseCase } from '../../../shared/models';

describe('Packages', () => {
  let component: Packages;
  let fixture: ComponentFixture<Packages>;
  let products: AssembledPC[];

  const createProduct = (
    overrides: Omit<Partial<AssembledPC>, 'title' | 'useCase'> & {
      title: string;
      useCase: UseCase;
      cpuBrand: 'Intel' | 'AMD';
      gpuBrand: 'NVIDIA' | 'AMD' | 'INTEL';
    }
  ): AssembledPC => {
    const { title, useCase, cpuBrand, gpuBrand, ...productOverrides } = overrides;
    const subcategoryByUseCase: Record<UseCase, string> = {
      [UseCase.GAMING]: 'pc-gaming',
      [UseCase.STREAMING]: 'pc-streaming',
      [UseCase.EDITING]: 'pc-editing',
      [UseCase.WORKSTATION]: 'pc-workstation',
      [UseCase.MIXED]: 'pc-workstation',
    };

    return {
      _id: title.toLowerCase().replace(/\s+/g, '-'),
      title,
      slug: title.toLowerCase().replace(/\s+/g, '-'),
      category: ProductCategory.ASSEMBLED,
      subcategory: subcategoryByUseCase[useCase],
      status: ProductStatus.ACTIVE,
      image: 'assets/test.png',
      price: 1000,
      currency: 'MXN',
      description: `${title} description`,
      stock: 1,
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      useCase,
      performanceTier: productOverrides.performanceTier ?? PerformanceTier.MID,
      specifications: {
        processor: { _id: 'cpu', title: `${cpuBrand} CPU` },
        motherboard: { _id: 'motherboard', title: 'Motherboard' },
        ram: { _id: 'ram', title: '32GB DDR5' },
        storage: [{ _id: 'storage', title: '1TB NVMe' }],
        graphicsCard: { _id: 'gpu', title: `${gpuBrand} GPU` },
        powerSupply: { _id: 'psu', title: '750W Gold' },
        case: { _id: 'case', title: 'Case' },
        cooling: { _id: 'cooling', title: 'AIO' },
      },
      performance: {
        cpuBrand,
        gpuBrand,
        gpuMemory: '12GB',
        cpuCores: 8,
        totalRam: '32GB DDR5',
        storageCapacity: '1TB NVMe',
      },
      certifications: {
        certificate: '80+ Gold',
        wattage: 750,
      },
      brandLogos: [],
      ...productOverrides,
    };
  };

  beforeEach(async () => {
    products = [
      createProduct({
        title: 'Gaming AMD NVIDIA',
        useCase: UseCase.GAMING,
        cpuBrand: 'AMD',
        gpuBrand: 'NVIDIA',
      }),
      createProduct({
        title: 'Editing Intel NVIDIA',
        useCase: UseCase.EDITING,
        cpuBrand: 'Intel',
        gpuBrand: 'NVIDIA',
      }),
      createProduct({
        title: 'Streaming AMD GPU',
        useCase: UseCase.STREAMING,
        cpuBrand: 'AMD',
        gpuBrand: 'AMD',
      }),
      createProduct({
        title: 'Workstation AMD NVIDIA',
        useCase: UseCase.MIXED,
        subcategory: 'pc-workstation',
        image: 'assets/workstation.png',
        cpuBrand: 'AMD',
        gpuBrand: 'NVIDIA',
        performanceTier: PerformanceTier.ULTRA,
      }),
      createProduct({
        title: 'Gaming Ultra NVIDIA',
        useCase: UseCase.GAMING,
        image: 'assets/gaming-ultra.png',
        cpuBrand: 'Intel',
        gpuBrand: 'NVIDIA',
        performanceTier: PerformanceTier.ULTRA,
      }),
    ];

    await TestBed.configureTestingModule({
      imports: [Packages],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            getAssembledPCs: () => of(products),
            toProductCardViewModel: (product: AssembledPC) => ({
              title: product.title,
              slug: product.slug,
              description: product.description,
              image: product.image,
              price: product.price,
              badges: [],
              specHighlights: [],
            }),
          },
        },
        provideRouter([]),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Packages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters by selected PC use', () => {
    component.selectedPcType = 'gaming';

    expect(component.filteredProducts.map((item) => item.product.title)).toEqual([
      'Gaming AMD NVIDIA',
      'Gaming Ultra NVIDIA',
    ]);
  });

  it('combines PC type and platform filters', () => {
    component.selectedPcType = 'editing';
    component.selectPlatform('intel');

    expect(component.filteredProducts.map((item) => item.product.title)).toEqual([
      'Editing Intel NVIDIA',
    ]);
  });

  it('filters NVIDIA by GPU brand only', () => {
    component.selectPlatform('nvidia');

    expect(component.filteredProducts.map((item) => item.product.title)).toEqual([
      'Gaming AMD NVIDIA',
      'Editing Intel NVIDIA',
      'Workstation AMD NVIDIA',
      'Gaming Ultra NVIDIA',
    ]);
  });

  it('uses subcategory to match workstation cards', () => {
    component.selectedPcType = 'workstation';

    expect(component.filteredProducts.map((item) => item.product.title)).toEqual([
      'Workstation AMD NVIDIA',
    ]);
  });

  it('clears all filters', () => {
    component.searchTerm = 'rtx';
    component.selectedTier = PerformanceTier.HIGH;
    component.selectedPcType = 'gaming';
    component.selectPlatform('nvidia');

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedTier).toBe('all');
    expect(component.selectedPcType).toBe('all');
    expect(component.selectedCpu).toBe('all');
    expect(component.selectedNvidia).toBeFalse();
  });

  it('builds a readable active filter summary', () => {
    component.selectedPcType = 'gaming';
    component.selectPlatform('nvidia');

    expect(component.activeFilterSummary).toBe('Mostrando 2 ensambles para Gaming + NVIDIA');
  });

  it('applies suggested filter combinations', () => {
    component.searchTerm = 'sin resultados';
    component.selectedTier = PerformanceTier.HIGH;

    component.applyFilterSuggestion(component.emptyStateSuggestions[0]);

    expect(component.searchTerm).toBe('');
    expect(component.selectedTier).toBe('all');
    expect(component.selectedPcType).toBe('gaming');
    expect(component.selectedNvidia).toBeTrue();
  });
  it('combines processor and NVIDIA tags, and toggles a tag off', () => {
    component.selectPlatform('amd');
    component.selectPlatform('nvidia');
    expect(component.filteredProducts.map(item => item.product.title)).toEqual([
      'Gaming AMD NVIDIA', 'Workstation AMD NVIDIA',
    ]);
    component.selectPlatform('nvidia');
    expect(component.filteredProducts.length).toBe(3);
  });

  it('renders dropdown filters without category images', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('button img').length).toBe(0);
    expect(element.querySelectorAll('.filter-dropdowns select').length).toBe(5);
    expect(element.textContent).toContain('Escuela');
    expect(element.textContent).toContain('Precio en MXN');
  });

  it('uses the displayed offer price and excludes the upper range boundary', () => {
    component.cards[0].price = 30000;
    component.cards[0].discountedPrice = 15000;
    component.cards[1].price = 25000;
    component.selectedPrice = '15to25';
    expect(component.filteredProducts.map(item => item.product.title)).toEqual(['Gaming AMD NVIDIA']);
    component.selectedPrice = 'under15';
    expect(component.filteredProducts.some(item => item.product.title === 'Gaming AMD NVIDIA')).toBeFalse();
  });

  it('combines all dimensions and resets them after an empty result', () => {
    component.selectedPcType = 'gaming';
    component.selectPlatform('amd');
    component.selectPlatform('nvidia');
    component.selectedTier = PerformanceTier.MID;
    component.selectedPrice = 'under15';
    component.searchTerm = 'Gaming';
    expect(component.filteredProducts.length).toBe(1);
    component.selectedPrice = '40plus';
    expect(component.filteredProducts.length).toBe(0);
    component.clearFilters();
    expect(component.filteredProducts.length).toBe(products.length);
    expect(component.hasActiveFilters).toBeFalse();
  });

  it('matches work and school from mixed use or explicit catalog descriptions', () => {
    component.products[0].description = 'Equipo para escuela';
    component.products[1].description = 'Equipo para oficina';
    component.selectedPcType = 'school';
    expect(component.filteredProducts.map(item => item.product.title)).toEqual(['Gaming AMD NVIDIA', 'Workstation AMD NVIDIA']);
    component.selectedPcType = 'work';
    expect(component.filteredProducts.map(item => item.product.title)).toEqual(['Editing Intel NVIDIA', 'Workstation AMD NVIDIA']);
  });

  it('removes only the selected active filter chip', () => {
    component.selectPlatform('amd');
    component.selectPlatform('nvidia');
    fixture.detectChanges();
    const chip: HTMLButtonElement | null = fixture.nativeElement.querySelector('[aria-label="Quitar filtro de procesador AMD"]');
    expect(chip).not.toBeNull();
    chip?.click();
    fixture.detectChanges();
    expect(component.selectedCpu).toBe('all');
    expect(component.selectedNvidia).toBeTrue();
  });

});
