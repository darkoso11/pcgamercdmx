import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  CatalogProduct,
  ProductCardViewModel,
  ProductsService,
} from '../services/products.service';
import { AssembledPC, PerformanceTier, UseCase } from '../../../shared/models';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
})
export class Packages implements OnInit {
  private readonly productsService = inject(ProductsService);

  products: AssembledPC[] = [];
  cards: ProductCardViewModel[] = [];
  searchTerm = '';
  selectedUseCase = 'all';
  selectedTier = 'all';

  readonly useCaseOptions = [
    { value: 'all', label: 'Todos los usos' },
    { value: UseCase.GAMING, label: 'Gaming' },
    { value: UseCase.STREAMING, label: 'Streaming' },
    { value: UseCase.EDITING, label: 'Edicion' },
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
        const matchesSearch =
          !normalized ||
          product.title.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized) ||
          card.specHighlights.some((spec) =>
            `${spec.label} ${spec.value}`.toLowerCase().includes(normalized)
          );

        return matchesUseCase && matchesTier && matchesSearch;
      });
  }

  getSummary(product: AssembledPC): string {
    return [product.performance.totalRam, product.performance.storageCapacity].join(' · ');
  }
}
