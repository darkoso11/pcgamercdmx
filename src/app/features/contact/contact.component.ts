import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
<<<<<<< HEAD
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BUSINESS_INFO } from '../../shared/config/business-info';

type AdvisorTheme = 'cyan' | 'pink';

interface AdvisorCard {
  name: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappUrl: string;
  email: string;
  theme: AdvisorTheme;
}
=======
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../../shared/config/business-info';
import { QuoteRequestService } from '../../core/services/quote-request.service';
>>>>>>> 651e7d46468a13afdc07a8d9a976bfb665314cc3

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  readonly business = BUSINESS_INFO;
  readonly mapEmbedUrl: SafeResourceUrl;
  readonly mapDirectionsUrl = BUSINESS_INFO.mapDirectionsUrl;
  readonly storeDetails = [
    BUSINESS_INFO.addressLong,
    `Telefono fijo ${BUSINESS_INFO.phoneNote.toLowerCase()}: ${BUSINESS_INFO.phoneDisplay}`,
    `Correo general: ${BUSINESS_INFO.email}`,
    `Horario: ${BUSINESS_INFO.businessHours.map(item => `${item.day} ${item.hours}`).join('; ')}`,
  ].join('. ');

  copiedTarget: 'store' | 'address' | null = null;
  expandedFaqIndex: number | null = null;

<<<<<<< HEAD
  readonly advisors: AdvisorCard[] = BUSINESS_INFO.salesAdvisors.map((advisor, index) => ({
    ...advisor,
    whatsappUrl: this.buildAdvisorWhatsAppUrl(advisor.whatsappNumber, advisor.name),
    theme: index === 0 ? 'cyan' : 'pink',
  }));
=======
  constructor(
    private fb: FormBuilder,
    private quoteRequests: QuoteRequestService
  ) {
    this.contactForm = this.fb.group({
      // Step 1
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9\s\-\+\(\)]+$/)]],
      
      // Step 2
      requestType: ['', Validators.required],
      serviceModality: ['', Validators.required],
      
      // Step 3
      city: [''],
      budgetRange: [''],
      message: ['', [Validators.required, Validators.minLength(10)]],
      dataConsent: [{ value: false, disabled: false }, Validators.requiredTrue],
      
      // File upload
      attachedFiles: ['']
    });
  }
>>>>>>> 651e7d46468a13afdc07a8d9a976bfb665314cc3

  readonly faqs = [
    {
      question: 'Me pueden asesorar antes de comprar?',
      answer: 'Si. Hugo y Omar pueden ayudarte a elegir componentes, revisar compatibilidad y ajustar el ensamble a tu presupuesto.'
    },
    {
      question: 'Puedo visitar la tienda para revisar opciones?',
      answer: `Si. Estamos en ${BUSINESS_INFO.addressShort}. Te recomendamos confirmar disponibilidad por WhatsApp antes de venir.`
    },
    {
      question: 'El telefono fijo recibe WhatsApp?',
      answer: `No. El ${BUSINESS_INFO.phoneDisplay} es ${BUSINESS_INFO.phoneNote.toLowerCase()}; para WhatsApp usa los botones de los asesores.`
    },
    {
      question: 'Manejan cotizaciones personalizadas?',
      answer: 'Si. Puedes escribirnos que juegos, programas o presupuesto tienes y te proponemos una configuracion adecuada.'
    }
  ];

  constructor(private sanitizer: DomSanitizer) {
    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(BUSINESS_INFO.mapEmbedUrl);
  }

  private buildAdvisorWhatsAppUrl(phone: string, advisorName: string): string {
    const message = `Hola, vengo del sitio de PC Gamer CDMX. Me interesa una cotizacion o asesoria para mi setup. Quiero contactar con ${advisorName}.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  toggleFaq(index: number): void {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
  }

  copyStoreDetails(): void {
    this.copyText(this.storeDetails, 'store');
  }

  copyAddress(): void {
    this.copyText(this.business.addressLong, 'address');
  }

  private copyText(text: string, target: 'store' | 'address'): void {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const done = () => {
      this.copiedTarget = target;
      window.setTimeout(() => {
        this.copiedTarget = null;
      }, 1800);
    };

<<<<<<< HEAD
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done);
      return;
=======
    this.submitted = true;
    this.successMessage = 'Abrimos WhatsApp con tu solicitud lista para enviar.';

    this.quoteRequests.submit({
      name: value.name,
      email: value.email,
      phone: value.phone,
      requestType: value.requestType,
      serviceModality: value.serviceModality,
      budget: value.budgetRange,
      message: value.message,
      dataConsent: value.dataConsent,
    }).subscribe();

    if (typeof window !== 'undefined') {
      window.open(buildWhatsAppUrl(message), '_blank');
>>>>>>> 651e7d46468a13afdc07a8d9a976bfb665314cc3
    }

    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    document.body.removeChild(area);
    done();
  }
}
