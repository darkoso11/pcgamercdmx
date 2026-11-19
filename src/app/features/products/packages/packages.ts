import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ProductCardViewModel,
  ProductsService,
} from '../services/products.service';
import { AssembledPC, PerformanceTier, UseCase } from '../../../shared/models';

type PcTypeFilter = 'all' | 'gaming' | 'streaming' | 'workstation' | 'creator' | 'editing' | 'work' | 'school';
type PlatformFilter = 'all' | 'amd' | 'intel' | 'nvidia';

interface EmptyStateSuggestion {
  label: string;
  description: string;
  pcType: PcTypeFilter;
  platform: PlatformFilter;
}

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
})
export class Packages implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly cdr = inject(ChangeDetectorRef);

  products: AssembledPC[] = [];
  cards: ProductCardViewModel[] = [];
  selectedCpu = 'all';
  selectedNvidia = false;
  selectedPrice = 'all';
  readonly priceOptions = [
    { value: 'all', label: 'Todos', min: 0, max: Infinity },
    { value: 'under15', label: 'Menos de $15,000', min: 0, max: 15000 },
    { value: '15to25', label: '$15,000–$25,000', min: 15000, max: 25000 },
    { value: '25to40', label: '$25,000–$40,000', min: 25000, max: 40000 },
    { value: '40plus', label: '$40,000 o más', min: 40000, max: Infinity },
  ];
  searchTerm = '';
  selectedTier = 'all';
  selectedPcType: PcTypeFilter = 'all';

  readonly pcTypeCards: Array<{ value: PcTypeFilter; title: string }> = [
    { value: 'all', title: 'Todas las PCs' },
    { value: 'gaming', title: 'Gaming' },
    { value: 'work', title: 'Trabajo' },
    { value: 'school', title: 'Escuela' },
    { value: 'creator', title: 'Diseño / 3D' },
    { value: 'workstation', title: 'Workstation' },
    { value: 'streaming', title: 'Streaming' },
    { value: 'editing', title: 'Edición de video' },
  ];

  readonly emptyStateSuggestions: EmptyStateSuggestion[] = [
    {
      label: 'Gaming + NVIDIA',
      description: 'Prioriza FPS, ray tracing y DLSS.',
      pcType: 'gaming',
      platform: 'nvidia',
    },
    {
      label: 'Streaming + AMD',
      description: 'Busca equilibrio entre CPU multinúcleo y presupuesto.',
      pcType: 'streaming',
      platform: 'amd',
    },
    {
      label: 'Diseño / 3D + Intel',
      description: 'Prueba builds para productividad creativa.',
      pcType: 'creator',
      platform: 'intel',
    },
  ];

  readonly tierOptions = [
    { value: 'all', label: 'Todos los niveles' },
    { value: PerformanceTier.ENTRY, label: 'Gama de entrada' },
    { value: PerformanceTier.MID, label: 'Gama media' },
    { value: PerformanceTier.HIGH, label: 'Gama alta' },
    { value: PerformanceTier.ULTRA, label: 'Gama ultra' },
  ];

  ngOnInit(): void {
    this.productsService.getAssembledPCs({ sortBy: 'price-asc' }).subscribe((products) => {
      this.products = products;
      this.cards = products.map((product) =>
        this.productsService.toProductCardViewModel(product)
      );
      this.cdr.detectChanges();
    });
  }

  get filteredProducts(): Array<{ product: AssembledPC; card: ProductCardViewModel }> {
    const normalized = this.searchTerm.trim().toLowerCase();

    return this.products
      .map((product, index) => ({ product, card: this.cards[index] }))
      .filter(({ product, card }) => {
        const matchesTier =
          this.selectedTier === 'all' || product.performanceTier === this.selectedTier;
        const matchesPcType = this.matchesPcType(product);
        const matchesPlatform = (this.selectedCpu === 'all' ||
          product.performance.cpuBrand.toLowerCase() === this.selectedCpu) &&
          (!this.selectedNvidia || product.performance.gpuBrand.toLowerCase() === 'nvidia');
        const range = this.priceOptions.find(option => option.value === this.selectedPrice)!;
        const price = card.discountedPrice ?? card.price;
        const matchesPrice = price >= range.min && price < range.max;
        const matchesSearch =
          !normalized ||
          product.title.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized) ||
          card.specHighlights.some((spec) =>
            `${spec.label} ${spec.value}`.toLowerCase().includes(normalized)
          );

        return matchesPrice && matchesTier && matchesPcType && matchesPlatform && matchesSearch;
      });
  }

  selectPlatform(platform: PlatformFilter): void {
    if (platform === 'nvidia') this.selectedNvidia = !this.selectedNvidia;
    else this.selectedCpu = this.selectedCpu === platform ? 'all' : platform;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTier = 'all';
    this.selectedPcType = 'all';
    this.selectedCpu = 'all';
    this.selectedNvidia = false;
    this.selectedPrice = 'all';
  }

  applyFilterSuggestion(suggestion: EmptyStateSuggestion): void {
    this.clearFilters();
    this.selectPlatform(suggestion.platform);
    this.selectedPcType = suggestion.pcType;
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      this.selectedTier !== 'all' ||
      this.selectedPcType !== 'all' ||
      this.selectedCpu !== 'all' || this.selectedNvidia || this.selectedPrice !== 'all'
    );
  }

  get activeFilterSummary(): string {
    const activeLabels = [
      this.getPcTypeLabel(this.selectedPcType),
      this.selectedCpu === 'all' ? '' : this.selectedCpu === 'amd' ? 'AMD' : 'Intel',
      this.selectedNvidia ? 'NVIDIA' : '',
      this.selectedPrice === 'all' ? '' : this.priceOptions.find(option => option.value === this.selectedPrice)?.label,
      this.getTierLabel(this.selectedTier),
      this.searchTerm.trim() ? `"${this.searchTerm.trim()}"` : '',
    ].filter(Boolean);
    const count = this.filteredProducts.length;
    const resultLabel = count === 1 ? 'ensamble' : 'ensambles';

    if (!activeLabels.length) {
      return `Mostrando ${count} ${resultLabel}`;
    }

    return `Mostrando ${count} ${resultLabel} para ${activeLabels.join(' + ')}`;
  }

  private matchesPcType(product: AssembledPC, type = this.selectedPcType): boolean {
    if (type === 'all') {
      return true;
    }

    if (type === 'work' || type === 'school') {
      const text = `${product.title} ${product.description} ${product.subcategory}`.toLowerCase();
      return product.useCase === UseCase.MIXED || (type === 'work'
        ? /trabajo|oficina|office|productividad/.test(text)
        : /escuela|escolar|estudi|educaci/.test(text));
    }

    if (type === 'creator') {
      return [UseCase.EDITING, UseCase.WORKSTATION, UseCase.MIXED].includes(product.useCase);
    }

    const useCaseByType: Record<Exclude<PcTypeFilter, 'all' | 'creator' | 'work' | 'school'>, UseCase> = {
      gaming: UseCase.GAMING,
      streaming: UseCase.STREAMING,
      workstation: UseCase.WORKSTATION,
      editing: UseCase.EDITING,
    };

    return product.useCase === useCaseByType[type] || product.subcategory === `pc-${type}`;
  }

  private getPcTypeLabel(type: PcTypeFilter): string {
    return this.pcTypeCards.find((card) => card.value === type && type !== 'all')?.title ?? '';
  }

  private getTierLabel(tier: string): string {
    return this.tierOptions.find((option) => option.value === tier && tier !== 'all')?.label ?? '';
  }
}
