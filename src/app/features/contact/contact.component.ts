import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  readonly advisors: AdvisorCard[] = BUSINESS_INFO.salesAdvisors.map((advisor, index) => ({
    ...advisor,
    whatsappUrl: this.buildAdvisorWhatsAppUrl(advisor.whatsappNumber, advisor.name),
    theme: index === 0 ? 'cyan' : 'pink',
  }));

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

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done);
      return;
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
