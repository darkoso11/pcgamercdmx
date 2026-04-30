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
      title: 'Armado profesional',
      description: 'Equipos pensados para venderse como solución completa, con selección de componentes coherente y lista para cotizar.',
    },
    {
      title: 'Compatibilidad validada',
      description: 'Cada build comunica hardware clave, tier de rendimiento y margen de personalización sin volverse una ficha saturada.',
    },
    {
      title: 'Asesoría real',
      description: 'La experiencia prioriza conversión a contacto, cotización y ajuste del setup según el uso real del cliente.',
    },
  ];

  readonly valueCards = [
    'Gaming competitivo con configuraciones claras y escalables.',
    'Builds para streaming, edición y cargas mixtas sin lenguaje técnico innecesario.',
    'Base visual premium con CTA directo a contacto y WhatsApp.',
  ];
}