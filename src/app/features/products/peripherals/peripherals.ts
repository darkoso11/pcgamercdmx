import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ProductCardViewModel,
  ProductsService,
} from '../services/products.service';
import { PeripheralProduct } from '../../../shared/models';

@Component({
  selector: 'app-peripherals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './peripherals.html',
  styleUrl: './peripherals.css',
})
export class Peripherals implements OnInit {
  private readonly productsService = inject(ProductsService);

  products: PeripheralProduct[] = [];
  cards: ProductCardViewModel[] = [];
  searchTerm = '';
  selectedType = 'all';

  readonly typeOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'keyboard', label: 'Teclados' },
    { value: 'mouse', label: 'Mouse' },
    { value: 'monitor', label: 'Monitores' },
    { value: 'headset', label: 'Headsets' },
  ];

  ngOnInit(): void {
    this.productsService.getPeripherals(undefined, { sortBy: 'price-asc' }).subscribe((products) => {
      this.products = products;
      this.cards = products.map((product) =>
        this.productsService.toProductCardViewModel(product)
      );
    });
  }

  get filteredProducts(): Array<{ product: PeripheralProduct; card: ProductCardViewModel }> {
    const normalized = this.searchTerm.trim().toLowerCase();

    return this.products
      .map((product, index) => ({ product, card: this.cards[index] }))
      .filter(({ product, card }) => {
        const matchesType =
          this.selectedType === 'all' || product.peripheralType === this.selectedType;
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
