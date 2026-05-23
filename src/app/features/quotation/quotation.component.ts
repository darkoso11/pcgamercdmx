import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuoteRequestService } from '../../core/services/quote-request.service';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../../shared/config/business-info';

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <main class="min-h-screen bg-[#070a1b] px-4 py-24 text-white">
      <section class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div class="space-y-6">
          <a routerLink="/" class="inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200">
            <i class="fas fa-arrow-left"></i>
            Volver al inicio
          </a>

          <div>
            <p class="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-pink-300">Cotizacion personalizada</p>
            <h1 class="max-w-3xl text-4xl font-black leading-tight md:text-6xl">Armemos la PC correcta para tu presupuesto</h1>
            <p class="mt-5 max-w-2xl text-base leading-7 text-gray-300 md:text-lg">
              Comparte uso, rango de precio y detalles clave. Abriremos WhatsApp con tu solicitud lista para enviarla al equipo.
            </p>
          </div>

          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-lg border border-white/10 bg-white/5 p-4">
              <p class="text-2xl font-black text-cyan-300">1</p>
              <p class="mt-2 text-sm text-gray-300">Describe tu uso principal.</p>
            </div>
            <div class="rounded-lg border border-white/10 bg-white/5 p-4">
              <p class="text-2xl font-black text-cyan-300">2</p>
              <p class="mt-2 text-sm text-gray-300">Define presupuesto y urgencia.</p>
            </div>
            <div class="rounded-lg border border-white/10 bg-white/5 p-4">
              <p class="text-2xl font-black text-cyan-300">3</p>
              <p class="mt-2 text-sm text-gray-300">Recibe una propuesta ajustada.</p>
            </div>
          </div>
        </div>

        <form [formGroup]="quoteForm" (ngSubmit)="submitQuote()" class="rounded-lg border border-cyan-400/20 bg-[#101633] p-6 shadow-2xl shadow-cyan-950/40">
          <div *ngIf="sent" class="mb-5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            WhatsApp se abrió con tu cotización lista.
          </div>

          <div class="grid gap-4">
            <label class="grid gap-2 text-sm text-gray-300">
              Nombre
              <input formControlName="name" class="rounded-lg border border-white/10 bg-[#070a1b] p-3 text-white outline-none focus:border-cyan-300" placeholder="Tu nombre" />
            </label>

            <label class="grid gap-2 text-sm text-gray-300">
              WhatsApp
              <input formControlName="phone" class="rounded-lg border border-white/10 bg-[#070a1b] p-3 text-white outline-none focus:border-cyan-300" placeholder="+52..." />
            </label>

            <label class="grid gap-2 text-sm text-gray-300">
              Uso principal
              <select formControlName="useCase" class="rounded-lg border border-white/10 bg-[#070a1b] p-3 text-white outline-none focus:border-cyan-300">
                <option value="">Selecciona una opción</option>
                <option>Gaming competitivo</option>
                <option>Gaming AAA / ultra</option>
                <option>Streaming</option>
                <option>Edición y creación de contenido</option>
                <option>Diseño 3D / render</option>
                <option>Trabajo y productividad</option>
              </select>
            </label>

            <label class="grid gap-2 text-sm text-gray-300">
              Presupuesto
              <select formControlName="budget" class="rounded-lg border border-white/10 bg-[#070a1b] p-3 text-white outline-none focus:border-cyan-300">
                <option value="">Selecciona un rango</option>
                <option>$15,000 - $20,000 MXN</option>
                <option>$20,000 - $30,000 MXN</option>
                <option>$30,000 - $40,000 MXN</option>
                <option>$40,000 - $60,000 MXN</option>
                <option>Más de $60,000 MXN</option>
              </select>
            </label>

            <label class="grid gap-2 text-sm text-gray-300">
              Detalles
              <textarea formControlName="details" rows="5" class="rounded-lg border border-white/10 bg-[#070a1b] p-3 text-white outline-none focus:border-cyan-300" placeholder="Juegos, monitor, componentes preferidos, fecha estimada..."></textarea>
            </label>

            <button type="submit" class="mt-2 rounded-lg bg-gradient-to-r from-cyan-400 to-pink-500 px-5 py-3 font-black text-[#070a1b] transition hover:brightness-110">
              Enviar por WhatsApp
            </button>
          </div>

          <p class="mt-4 text-center text-xs text-gray-400">
            También puedes escribir directo a {{ business.phoneDisplay }}.
          </p>
        </form>
      </section>
    </main>
  `,
  styleUrls: ['./quotation.component.css']
})
export class QuotationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly quoteRequests = inject(QuoteRequestService);
  readonly business = BUSINESS_INFO;
  sent = false;

  readonly quoteForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required, Validators.minLength(8)]],
    useCase: ['', Validators.required],
    budget: ['', Validators.required],
    details: ['', [Validators.required, Validators.minLength(10)]],
  });
  submitQuote(): void {
    if (this.quoteForm.invalid) {
      this.quoteForm.markAllAsTouched();
      return;
    }

    const value = this.quoteForm.getRawValue();
    const message = [
      'Hola PC Gamer CDMX, quiero cotizar una PC personalizada.',
      `Nombre: ${value.name}`,
      `WhatsApp: ${value.phone}`,
      `Uso principal: ${value.useCase}`,
      `Presupuesto: ${value.budget}`,
      `Detalles: ${value.details}`,
    ].join('\n');

    this.sent = true;

    this.quoteRequests.submit({
      name: value.name ?? '',
      phone: value.phone ?? '',
      requestType: 'cotizacion',
      serviceModality: value.useCase,
      budget: value.budget,
      message: value.details ?? '',
      dataConsent: true,
    }).subscribe();

    if (typeof window !== 'undefined') {
      window.open(buildWhatsAppUrl(message), '_blank');
    }
  }
}
