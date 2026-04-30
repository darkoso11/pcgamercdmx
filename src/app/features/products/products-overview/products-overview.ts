import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ProductCardViewModel,
  ProductsService,
} from '../services/products.service';
import { ProductCategory } from '../../../shared/models';

@Component({
  selector: 'app-products-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products-overview.html',
  styleUrl: './products-overview.css',
})
export class ProductsOverview implements OnInit {
  private readonly productsService = inject(ProductsService);

  featuredAssemblies: ProductCardViewModel[] = [];
  featuredComponents: ProductCardViewModel[] = [];
  featuredPeripherals: ProductCardViewModel[] = [];

  readonly entryCards = [
    {
      title: 'Ensambles de PC',
      description:
        'Superficie comercial dedicada a PCs armadas con componentes claros, enfoque de uso y CTA directo a cotizacion.',
      link: '/ensambles',
      action: 'Ver ensambles',
    },
    {
      title: 'Componentes',
      description:
        'Hardware suelto organizado para busqueda, comparacion y crecimiento posterior con filtros mas profundos.',
      link: '/productos/componentes',
      action: 'Ver componentes',
    },
    {
      title: 'Perifericos',
      description:
        'Teclados, mouse, monitores y audio sobre una misma estructura de catalogo y detalle individual.',
      link: '/productos/perifericos',
      action: 'Ver perifericos',
    },
  ];

  ngOnInit(): void {
    this.productsService.getFeaturedCatalogProducts(12).subscribe((products) => {
      const cards = products.map((product) =>
        this.productsService.toProductCardViewModel(product)
      );

      this.featuredAssemblies = cards.filter(
        (card) => card.category === ProductCategory.ASSEMBLED
      );
      this.featuredComponents = cards.filter(
        (card) => card.category === ProductCategory.COMPONENT
      );
      this.featuredPeripherals = cards.filter(
        (card) => card.category === ProductCategory.PERIPHERAL
      );
    });
  }
}
