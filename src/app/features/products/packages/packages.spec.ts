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

  it('filters by selected PC type card', () => {
    component.selectPcType('gaming');

    expect(component.filteredProducts.map((item) => item.product.title)).toEqual([
      'Gaming AMD NVIDIA',
      'Gaming Ultra NVIDIA',
    ]);
  });

  it('combines PC type and platform filters', () => {
    component.selectPcType('editing');
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
    component.selectPcType('workstation');

    expect(component.filteredProducts.map((item) => item.product.title)).toEqual([
      'Workstation AMD NVIDIA',
    ]);
  });

  it('clears all filters', () => {
    component.searchTerm = 'rtx';
    component.selectedUseCase = UseCase.GAMING;
    component.selectedTier = PerformanceTier.HIGH;
    component.selectPcType('gaming');
    component.selectPlatform('nvidia');

    component.clearFilters();

    expect(component.searchTerm).toBe('');
    expect(component.selectedUseCase).toBe('all');
    expect(component.selectedTier).toBe('all');
    expect(component.selectedPcType).toBe('all');
    expect(component.selectedPlatform).toBe('all');
  });

  it('builds a readable active filter summary', () => {
    component.selectPcType('gaming');
    component.selectPlatform('nvidia');

    expect(component.activeFilterSummary).toBe('Mostrando 2 ensambles para Gaming + NVIDIA');
  });

  it('uses the highest tier matching product as the card image', () => {
    expect(component.getPcTypeImage('gaming')).toBe('assets/gaming-ultra.png');
  });

  it('applies suggested filter combinations', () => {
    component.searchTerm = 'sin resultados';
    component.selectedTier = PerformanceTier.HIGH;

    component.applyFilterSuggestion(component.emptyStateSuggestions[0]);

    expect(component.searchTerm).toBe('');
    expect(component.selectedTier).toBe('all');
    expect(component.selectedPcType).toBe('gaming');
    expect(component.selectedPlatform).toBe('nvidia');
  });
});
