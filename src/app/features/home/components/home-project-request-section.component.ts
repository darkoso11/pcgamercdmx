import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { buildWhatsAppUrl } from '../../../shared/config/business-info';

@Component({
  selector: 'app-home-project-request-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home-project-request-section.component.html',
})
export class HomeProjectRequestSectionComponent {
  projectRequestSent = false;

  submitProjectRequest(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const value = form.value;
    const message = [
      'Hola PC Gamer CDMX, quiero cotizar una PC personalizada.',
      `Nombre: ${value.name}`,
      `Correo: ${value.email}`,
      `WhatsApp: ${value.phone}`,
      `Uso principal: ${value.mainUse}`,
      `Presupuesto: ${value.budget}`,
      `Detalles: ${value.details}`,
    ].filter(Boolean).join('\n');

    this.projectRequestSent = true;

    if (typeof window !== 'undefined') {
      window.open(buildWhatsAppUrl(message), '_blank');
    }

    form.resetForm();

    setTimeout(() => {
      this.projectRequestSent = false;
    }, 3500);
  }
}
