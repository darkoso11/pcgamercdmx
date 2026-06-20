import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

type LegalPageData = {
  eyebrow: string;
  title: string;
  description: string;
  sourceLabel?: string;
  ctaLabel?: string;
  ctaLink?: string;
  sections: Array<{ title: string; body: string; accent?: string }>;
};

const PAGE_DATA: Record<string, LegalPageData> = {
  privacidad: {
    eyebrow: 'Aviso legal',
    title: 'Politica de privacidad',
    description:
      'Esta pagina resume como PC Gamer CDMX debe tratar la informacion enviada por formularios, cotizaciones y contacto.',
    sections: [
      {
        title: 'Informacion recopilada',
        body:
          'El sitio puede solicitar nombre, correo, telefono, presupuesto, tipo de uso y detalles tecnicos necesarios para responder solicitudes comerciales.',
      },
      {
        title: 'Uso de la informacion',
        body:
          'Los datos se usan para seguimiento de cotizaciones, contacto comercial, soporte y mejora de la experiencia del sitio.',
      },
      {
        title: 'Estado actual',
        body:
          'El frontend esta preparado para integrarse con un backend. La politica final debe validarse antes de publicar el sitio en produccion.',
      },
    ],
  },
  terminos: {
    eyebrow: 'Politicas de devolucion',
    title: 'Terminos y condiciones',
    description:
      'En PC Gamer CDMX cada compra se acompana con asesoria tecnica, verificacion de componentes y soporte para que tu equipo llegue probado, sellado y listo para usarse.',
    sourceLabel: 'Contenido migrado desde pcgamercdmx.mx/9266-2',
    ctaLabel: 'Contactar asesor',
    ctaLink: '/contacto',
    sections: [
      {
        title: '1. Nuestro compromiso contigo',
        body:
          'Antes de concretar una compra, el equipo tecnico puede orientarte para elegir una computadora acorde a tus necesidades reales de juego, trabajo, creacion, compatibilidad y presupuesto.',
        accent: 'Asesoria personalizada',
      },
      {
        title: '2. Politica de devoluciones',
        body:
          'Por la naturaleza tecnica y personalizada de los productos, no se aceptan cambios ni devoluciones despues de realizada la compra. Esta politica ayuda a garantizar que cada pieza entregada sea nueva, sin uso previo y configurada para el cliente que la solicito.',
        accent: 'Compra final',
      },
      {
        title: '3. Productos con garantia',
        body:
          'Los productos comercializados cuentan con garantia directa del fabricante o proveedor oficial para defectos de fabrica durante el periodo definido por cada marca. Si detectas una falla tecnica, el equipo te orientara para gestionar reparacion o reemplazo segun aplique.',
        accent: 'Soporte de marca',
      },
      {
        title: '4. Asesoria previa a la compra',
        body:
          'Recomendamos resolver dudas de compatibilidad, rendimiento y alcance antes de comprar. La meta es evitar errores de seleccion y entregar desde el inicio el equipo o componente correcto para tu setup.',
        accent: 'Compra informada',
      },
    ],
  },
};

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="min-h-screen overflow-hidden bg-[#050716] px-4 py-24 text-white md:px-8">
      <section class="relative mx-auto max-w-6xl">
        <div class="absolute inset-0 -z-10 opacity-70">
          <div class="absolute left-0 top-8 h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div class="absolute bottom-0 right-6 h-72 w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent"></div>
          <div class="absolute -right-24 top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl"></div>
          <div class="absolute -left-16 bottom-8 h-60 w-60 rounded-full bg-pink-500/10 blur-3xl"></div>
        </div>

        <a routerLink="/" class="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-100">
          <i class="fas fa-chevron-left text-xs"></i>
          Volver al inicio
        </a>

        <div class="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <header class="relative border-l-2 border-cyan-300/80 pl-6">
            <p class="text-xs font-semibold uppercase tracking-[0.28em] text-pink-300">
              {{ page.eyebrow }}
            </p>
            <h1 class="mt-4 font-orbitron text-4xl font-black leading-tight text-white drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] md:text-6xl">
              {{ page.title }}
            </h1>
            <p class="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              {{ page.description }}
            </p>

            <p *ngIf="page.sourceLabel" class="mt-6 inline-flex border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {{ page.sourceLabel }}
            </p>

            <a
              *ngIf="page.ctaLabel && page.ctaLink"
              [routerLink]="page.ctaLink"
              class="mt-8 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-[0_0_24px_rgba(236,72,153,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(34,211,238,0.38)]"
            >
              {{ page.ctaLabel }}
              <i class="fas fa-arrow-right text-xs"></i>
            </a>
          </header>

          <div class="grid gap-4">
            <article
              *ngFor="let section of page.sections"
              class="group relative overflow-hidden border border-white/10 bg-[#0b1027]/90 p-5 shadow-[0_0_24px_rgba(14,165,233,0.08)] transition hover:border-cyan-300/60 hover:bg-[#101737]"
            >
              <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-pink-500 via-cyan-300 to-transparent opacity-80"></div>
              <p *ngIf="section.accent" class="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-cyan-300">
                {{ section.accent }}
              </p>
              <h2 class="mt-2 font-orbitron text-xl font-bold text-white">{{ section.title }}</h2>
              <p class="mt-3 text-sm leading-7 text-slate-300">{{ section.body }}</p>
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
