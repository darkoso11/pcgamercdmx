import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ProductCardViewModel,
  ProductsService,
} from '../services/products.service';
import { AssembledPC, PerformanceTier, UseCase } from '../../../shared/models';

type PcTypeFilter = 'all' | 'gaming' | 'streaming' | 'workstation' | 'creator' | 'editing';
type PlatformFilter = 'all' | 'amd' | 'intel' | 'nvidia';

interface EmptyStateSuggestion {
  label: string;
  description: string;
  pcType: PcTypeFilter;
  platform: PlatformFilter;
}

const tierWeight: Record<PerformanceTier, number> = {
  [PerformanceTier.ENTRY]: 1,
  [PerformanceTier.MID]: 2,
  [PerformanceTier.HIGH]: 3,
  [PerformanceTier.ULTRA]: 4,
};

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
  pcTypeCounts: Record<PcTypeFilter, number> = {
    all: 0,
    gaming: 0,
    streaming: 0,
    workstation: 0,
    creator: 0,
    editing: 0,
  };
  pcTypeImages: Record<PcTypeFilter, string> = {
    all: 'assets/img/gabinetes/BR-938686_1.png',
    gaming: 'assets/img/gabinetes/BR-938686_1.png',
    streaming: 'assets/img/gabinetes/BR-938686_1.png',
    workstation: 'assets/img/gabinetes/BR-938686_1.png',
    creator: 'assets/img/gabinetes/BR-938686_1.png',
    editing: 'assets/img/gabinetes/BR-938686_1.png',
  };
  platformCounts: Record<PlatformFilter, number> = {
    all: 0,
    amd: 0,
    intel: 0,
    nvidia: 0,
  };
  searchTerm = '';
  selectedUseCase = 'all';
  selectedTier = 'all';
  selectedPcType: PcTypeFilter = 'all';
  selectedPlatform: PlatformFilter = 'all';

  readonly pcTypeCards: Array<{
    value: PcTypeFilter;
    eyebrow: string;
    title: string;
    description: string;
    specs: string;
  }> = [
    {
      value: 'all',
      eyebrow: 'Catálogo completo',
      title: 'Todas las PCs',
      description: 'Explora todos los ensambles listos para cotizar.',
      specs: 'Gaming, trabajo y creación',
    },
    {
      value: 'gaming',
      eyebrow: 'Alto FPS',
      title: 'Gaming',
      description: 'Equipos para jugar fluido en 1080p, 1440p o 4K.',
      specs: 'GPU dedicada y upgrades claros',
    },
    {
      value: 'streaming',
      eyebrow: 'Juego + directo',
      title: 'Streaming',
      description: 'Builds para jugar, grabar y transmitir sin perder estabilidad.',
      specs: 'CPU multinúcleo y NVIDIA NVENC',
    },
    {
      value: 'workstation',
      eyebrow: 'Carga profesional',
      title: 'Workstation',
      description: 'Máquinas para renders, simulación y trabajo sostenido.',
      specs: 'RAM amplia y enfriamiento serio',
    },
    {
      value: 'creator',
      eyebrow: 'Modelado y render',
      title: 'Diseño / 3D',
      description: 'PCs pensadas para Blender, CAD, motion y escenas pesadas.',
      specs: 'VRAM, CPU y almacenamiento rápido',
    },
    {
      value: 'editing',
      eyebrow: 'Postproducción',
      title: 'Edición de video',
      description: 'Configuraciones para timeline, codecs y exportaciones largas.',
      specs: '64GB opcional y GPU RTX',
    },
  ];

  readonly platformFilters: Array<{
    value: PlatformFilter;
    label: string;
    description: string;
  }> = [
    { value: 'all', label: 'Todas', description: 'Sin filtro de marca' },
    { value: 'amd', label: 'AMD', description: 'CPU o GPU AMD' },
    { value: 'intel', label: 'Intel', description: 'Procesador Intel' },
    { value: 'nvidia', label: 'NVIDIA', description: 'GPU NVIDIA' },
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

  readonly useCaseOptions = [
    { value: 'all', label: 'Todos los usos' },
    { value: UseCase.GAMING, label: 'Gaming' },
    { value: UseCase.STREAMING, label: 'Streaming' },
    { value: UseCase.EDITING, label: 'Edición' },
    { value: UseCase.MIXED, label: 'Mixto' },
  ];

  readonly tierOptions = [
    { value: 'all', label: 'Todos los niveles' },
    { value: PerformanceTier.ENTRY, label: 'Entry' },
    { value: PerformanceTier.MID, label: 'Mid' },
    { value: PerformanceTier.HIGH, label: 'High' },
    { value: PerformanceTier.ULTRA, label: 'Ultra' },
  ];

  ngOnInit(): void {
    this.productsService.getAssembledPCs({ sortBy: 'price-asc' }).subscribe((products) => {
      this.products = products;
      this.cards = products.map((product) =>
        this.productsService.toProductCardViewModel(product)
      );
      this.updateFilterMetadata();
      this.cdr.detectChanges();
    });
  }

  get filteredProducts(): Array<{ product: AssembledPC; card: ProductCardViewModel }> {
    const normalized = this.searchTerm.trim().toLowerCase();

    return this.products
      .map((product, index) => ({ product, card: this.cards[index] }))
      .filter(({ product, card }) => {
        const matchesUseCase =
          this.selectedUseCase === 'all' || product.useCase === this.selectedUseCase;
        const matchesTier =
          this.selectedTier === 'all' || product.performanceTier === this.selectedTier;
        const matchesPcType = this.matchesPcType(product);
        const matchesPlatform = this.matchesPlatform(product);
        const matchesSearch =
          !normalized ||
          product.title.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized) ||
          card.specHighlights.some((spec) =>
            `${spec.label} ${spec.value}`.toLowerCase().includes(normalized)
          );

        return matchesUseCase && matchesTier && matchesPcType && matchesPlatform && matchesSearch;
      });
  }

  selectPcType(type: PcTypeFilter): void {
    this.selectedPcType = type;
  }

  selectPlatform(platform: PlatformFilter): void {
    this.selectedPlatform = platform;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedUseCase = 'all';
    this.selectedTier = 'all';
    this.selectedPcType = 'all';
    this.selectedPlatform = 'all';
  }

  applyFilterSuggestion(suggestion: EmptyStateSuggestion): void {
    this.searchTerm = '';
    this.selectedUseCase = 'all';
    this.selectedTier = 'all';
    this.selectedPcType = suggestion.pcType;
    this.selectedPlatform = suggestion.platform;
  }

  get hasActiveFilters(): boolean {
    return (
      !!this.searchTerm.trim() ||
      this.selectedUseCase !== 'all' ||
      this.selectedTier !== 'all' ||
      this.selectedPcType !== 'all' ||
      this.selectedPlatform !== 'all'
    );
  }

  get activeFilterSummary(): string {
    const activeLabels = [
      this.getPcTypeLabel(this.selectedPcType),
      this.getPlatformLabel(this.selectedPlatform),
      this.getUseCaseLabel(this.selectedUseCase),
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

  getSummary(product: AssembledPC): string {
    return [product.performance.totalRam, product.performance.storageCapacity].join(' · ');
  }

  getPcTypeCount(type: PcTypeFilter): number {
    return this.pcTypeCounts[type];
  }

  getPcTypeImage(type: PcTypeFilter): string {
    return this.pcTypeImages[type];
  }

  getPlatformCount(platform: PlatformFilter): number {
    return this.platformCounts[platform];
  }

  private updateFilterMetadata(): void {
    this.pcTypeCounts = this.pcTypeCards.reduce(
      (counts, card) => ({
        ...counts,
        [card.value]: this.products.filter((product) => this.matchesPcType(product, card.value)).length,
      }),
      {} as Record<PcTypeFilter, number>
    );
    this.pcTypeImages = this.pcTypeCards.reduce(
      (images, card) => ({
        ...images,
        [card.value]: this.getRepresentativeProduct(card.value)?.image ?? 'assets/img/gabinetes/BR-938686_1.png',
      }),
      {} as Record<PcTypeFilter, string>
    );
    this.platformCounts = this.platformFilters.reduce(
      (counts, platform) => ({
        ...counts,
        [platform.value]: this.products.filter((product) => this.matchesPlatform(product, platform.value)).length,
      }),
      {} as Record<PlatformFilter, number>
    );
  }

  private getRepresentativeProduct(type: PcTypeFilter): AssembledPC | undefined {
    const matchingProducts = this.products.filter((product) => this.matchesPcType(product, type));
    const candidates = matchingProducts.length ? matchingProducts : this.products;

    return [...candidates].sort((a, b) => {
      const tierDifference = tierWeight[b.performanceTier] - tierWeight[a.performanceTier];

      return tierDifference || b.price - a.price;
    })[0];
  }

  private matchesPcType(product: AssembledPC, type = this.selectedPcType): boolean {
    if (type === 'all') {
      return true;
    }

    if (type === 'creator') {
      return [UseCase.EDITING, UseCase.WORKSTATION, UseCase.MIXED].includes(product.useCase);
    }

    const useCaseByType: Record<Exclude<PcTypeFilter, 'all' | 'creator'>, UseCase> = {
      gaming: UseCase.GAMING,
      streaming: UseCase.STREAMING,
      workstation: UseCase.WORKSTATION,
      editing: UseCase.EDITING,
    };

    return product.useCase === useCaseByType[type] || product.subcategory === `pc-${type}`;
  }

  private matchesPlatform(product: AssembledPC, platform = this.selectedPlatform): boolean {
    if (platform === 'all') {
      return true;
    }

    if (platform === 'nvidia') {
      return product.performance.gpuBrand.toLowerCase() === 'nvidia';
    }

    if (platform === 'intel') {
      return product.performance.cpuBrand.toLowerCase() === 'intel';
    }

    return (
      product.performance.cpuBrand.toLowerCase() === 'amd' ||
      product.performance.gpuBrand.toLowerCase() === 'amd'
    );
  }

  private getPcTypeLabel(type: PcTypeFilter): string {
    return this.pcTypeCards.find((card) => card.value === type && type !== 'all')?.title ?? '';
  }

  private getPlatformLabel(platform: PlatformFilter): string {
    return this.platformFilters.find((filter) => filter.value === platform && platform !== 'all')?.label ?? '';
  }

  private getUseCaseLabel(useCase: string): string {
    return this.useCaseOptions.find((option) => option.value === useCase && useCase !== 'all')?.label ?? '';
  }

  private getTierLabel(tier: string): string {
    return this.tierOptions.find((option) => option.value === tier && tier !== 'all')?.label ?? '';
  }
}
