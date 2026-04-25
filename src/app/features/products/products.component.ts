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
      description: 'Resumen del catalogo, destacados y rutas rapidas.',
    },
    {
      label: 'Ensambles',
      link: '/productos/paquetes',
      exact: false,
      description: 'PCs armadas listas para gaming, streaming y edicion.',
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
      value: 'Fase 1',
      label: 'Ensambles como eje principal del catalogo',
    },
    {
      value: 'Fase 2',
      label: 'Componentes y perifericos sobre la misma base',
    },
    {
      value: 'SEO ready',
      label: 'Rutas limpias y categorias preparadas para indexacion',
    },
  ];
}
