import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  readonly segments = [
    {
      label: 'Vista general',
      link: '/productos',
      exact: true,
      description: 'Entrada al catalogo y rutas rapidas por tipo de producto.',
    },
    {
      label: 'Componentes',
      link: '/productos/componentes',
      exact: false,
      description: 'Hardware suelto para upgrades y builds a medida.',
    },
    {
      label: 'Perifericos',
      link: '/productos/perifericos',
      exact: false,
      description: 'Teclados, mouse, monitores y audio gaming.',
    },
  ];

  readonly highlights = [
    {
      value: 'Catalogo',
      label: 'Navegacion limpia para explorar hardware y perifericos.',
    },
    {
      value: 'Compatibilidad',
      label: 'Base preparada para crecer con filtros, SEO y detalle por categoria.',
    },
    {
      value: 'Asesoria',
      label: 'Los ensambles viven en su propia superficie comercial y el catalogo se mantiene enfocado.',
    },
  ];
}
