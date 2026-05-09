import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type LegalPageData = {
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{ title: string; body: string }>;
};

const PAGE_DATA: Record<string, LegalPageData> = {
  privacidad: {
    eyebrow: 'Aviso legal',
    title: 'Política de privacidad',
    description:
      'Esta página resume cómo PC Gamer CDMX debe tratar la información enviada por formularios, cotizaciones y contacto.',
    sections: [
      {
        title: 'Información recopilada',
        body:
          'El sitio puede solicitar nombre, correo, teléfono, presupuesto, tipo de uso y detalles técnicos necesarios para responder solicitudes comerciales.',
      },
      {
        title: 'Uso de la información',
        body:
          'Los datos se usan para seguimiento de cotizaciones, contacto comercial, soporte y mejora de la experiencia del sitio.',
      },
      {
        title: 'Estado actual',
        body:
          'El frontend está preparado para integrarse con un backend. La política final debe validarse antes de publicar el sitio en producción.',
      },
    ],
  },
  terminos: {
    eyebrow: 'Aviso legal',
    title: 'Términos y condiciones',
    description:
      'Condiciones generales para navegación, cotizaciones y referencias comerciales dentro del sitio de PC Gamer CDMX.',
    sections: [
      {
        title: 'Cotizaciones',
        body:
          'Los precios mostrados pueden ser referenciales y depender de disponibilidad, configuración, personalización y vigencia de componentes.',
      },
      {
        title: 'Contenido del sitio',
        body:
          'Las fichas, imágenes y especificaciones deben considerarse informativas hasta confirmarse con el equipo comercial.',
      },
      {
        title: 'Estado actual',
        body:
          'Estos términos funcionan como placeholder operativo y deben revisarse legalmente antes de producción.',
      },
    ],
  },
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen bg-[#070b1a] px-4 py-24 text-white md:px-8">
      <section class="mx-auto max-w-4xl">
        <a routerLink="/" class="text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
          Volver al inicio
        </a>

        <div class="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-6 md:p-10">
          <p class="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            {{ page.eyebrow }}
          </p>
          <h1 class="mt-4 text-4xl font-bold leading-tight md:text-5xl">
            {{ page.title }}
          </h1>
          <p class="mt-5 max-w-3xl text-base leading-7 text-slate-300">
            {{ page.description }}
          </p>

          <div class="mt-10 grid gap-5">
            <article
              *ngFor="let section of page.sections"
              class="rounded-xl border border-white/10 bg-[#0e1430] p-5"
            >
              <h2 class="text-lg font-semibold text-white">{{ section.title }}</h2>
              <p class="mt-3 text-sm leading-6 text-slate-300">{{ section.body }}</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class LegalPageComponent {
  readonly page: LegalPageData;

  constructor(route: ActivatedRoute) {
    const key = route.snapshot.data['page'] as string;
    this.page = PAGE_DATA[key] ?? PAGE_DATA['privacidad'];
  }
}
