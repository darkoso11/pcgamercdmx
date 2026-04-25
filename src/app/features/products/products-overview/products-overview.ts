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

  readonly phaseCards = [
    {
      title: 'Fase 1: Ensambles de PC',
      description:
        'Catalogo comercial de PCs armadas con componentes claros, enfoque de uso y CTA directo a cotizacion.',
      link: '/productos/paquetes',
      action: 'Ver ensambles',
    },
    {
      title: 'Fase 2: Componentes',
      description:
        'Hardware suelto listo para filtrado por categoria, marca y compatibilidad futura.',
      link: '/productos/componentes',
      action: 'Ver componentes',
    },
    {
      title: 'Fase 2: Perifericos',
      description:
        'Teclados, mouse, monitores y audio sobre la misma estructura de catalogo y SEO.',
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
