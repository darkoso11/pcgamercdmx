import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Packages } from '../products/packages/packages';

@Component({
  selector: 'app-assemblies',
  standalone: true,
  imports: [CommonModule, RouterModule, Packages],
  templateUrl: './assemblies.component.html',
  styleUrl: './assemblies.component.css',
})
export class AssembliesComponent {
  readonly trustPoints = [
    {
      title: 'Diagnóstico de uso',
      description: 'Partimos de tus juegos, programas y presupuesto para recomendar una configuración con sentido.',
    },
    {
      title: 'Componentes compatibles',
      description: 'Procesador, GPU, fuente, gabinete y enfriamiento se revisan como sistema, no como piezas aisladas.',
    },
    {
      title: 'Cotización ajustable',
      description: 'Puedes partir de una build recomendada y ajustar marca, estética o rendimiento antes de comprar.',
    },
  ];

  readonly valueCards = [
    'Gaming competitivo con configuraciones claras y escalables.',
    'Streaming, edición y cargas mixtas sin lenguaje técnico innecesario.',
    'Opciones por AMD, Intel y NVIDIA para comparar más rápido.',
  ];

  readonly heroHighlights = ['Gaming', 'Streaming', 'Diseño 3D', 'Workstation'];
}
