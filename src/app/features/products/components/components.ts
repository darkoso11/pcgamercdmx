import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ProductCardViewModel,
  ProductsService,
} from '../services/products.service';
import { ComponentProduct } from '../../../shared/models';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './components.html',
  styleUrl: './components.css',
})
export class Components implements OnInit {
  private readonly productsService = inject(ProductsService);

  products: ComponentProduct[] = [];
  cards: ProductCardViewModel[] = [];
  searchTerm = '';
  selectedType = 'all';

  readonly typeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'cpu', label: 'CPU' },
    { value: 'gpu', label: 'GPU' },
    { value: 'ram', label: 'RAM' },
    { value: 'storage', label: 'Storage' },
  ];

  ngOnInit(): void {
    this.productsService.getComponentsByType(undefined, { sortBy: 'price-asc' }).subscribe((products) => {
      this.products = products;
      this.cards = products.map((product) =>
        this.productsService.toProductCardViewModel(product)
      );
    });
  }

  get filteredProducts(): Array<{ product: ComponentProduct; card: ProductCardViewModel }> {
    const normalized = this.searchTerm.trim().toLowerCase();

    return this.products
      .map((product, index) => ({ product, card: this.cards[index] }))
      .filter(({ product, card }) => {
        const matchesType =
          this.selectedType === 'all' || product.componentType === this.selectedType;
        const matchesSearch =
          !normalized ||
          product.title.toLowerCase().includes(normalized) ||
          product.description.toLowerCase().includes(normalized) ||
          card.specHighlights.some((spec) =>
            `${spec.label} ${spec.value}`.toLowerCase().includes(normalized)
          );

        return matchesType && matchesSearch;
      });
  }
}
