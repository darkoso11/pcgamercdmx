import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BUSINESS_INFO, buildWhatsAppUrl } from '../../shared/config/business-info';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  formStep: number = 1;
  submitted: boolean = false;
  successMessage: string = '';
  readonly business = BUSINESS_INFO;
  
  // Métodos de contacto
  contactMethods = [
    {
      id: 1,
      title: 'Teléfono',
      value: BUSINESS_INFO.phoneDisplay,
      icon: 'fas fa-phone',
      action: BUSINESS_INFO.phoneHref
    },
    {
      id: 2,
      title: 'WhatsApp',
      value: BUSINESS_INFO.phoneDisplay,
      icon: 'fab fa-whatsapp',
      action: BUSINESS_INFO.whatsappUrl
    },
    {
      id: 3,
      title: 'Correo',
      value: BUSINESS_INFO.email,
      icon: 'fas fa-envelope',
      action: `mailto:${BUSINESS_INFO.email}`
    },
    {
      id: 4,
      title: 'Ubicación',
      value: BUSINESS_INFO.addressShort,
      icon: 'fas fa-map-marker-alt',
      action: '#ubicacion'
    }
  ];

  // Tipos de solicitud
  requestTypes = [
    'Consulta General',
    'Soporte Técnico',
    'Presupuesto',
    'Cotización de Servicio',
    'Otro'
  ];

  // Modalidades de servicio
  serviceModalities = [
    'Soporte Remoto',
    'Servicio en Tienda',
    'Servicio a Domicilio'
  ];

  // Horarios
  businessHours = [...BUSINESS_INFO.businessHours];

  // Redes sociales
  socialNetworks = [
    { icon: 'fab fa-facebook-f', url: BUSINESS_INFO.social.facebook, name: 'Facebook', color: '#3b5998' },
    { icon: 'fab fa-instagram', url: BUSINESS_INFO.social.instagram, name: 'Instagram', color: '#e1306c' },
    { icon: 'fab fa-tiktok', url: BUSINESS_INFO.social.tiktok, name: 'TikTok', color: '#000000' },
    { icon: 'fab fa-youtube', url: BUSINESS_INFO.social.youtube, name: 'YouTube', color: '#ff0000' }
  ];

  // FAQ
  faqs = [
    {
      question: '¿Cuánto tiempo tarda una reparación?',
      answer: 'El tiempo varía según la complejidad. Las reparaciones simples (1-3 días hábiles), complejas (3-7 días hábiles).'
    },
    {
      question: '¿Cuál es la garantía de los servicios?',
      answer: 'Ofrecemos garantía de 3 meses en todas nuestras reparaciones y 1 año en equipos nuevos.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos efectivo, transferencia bancaria, tarjetas de crédito/débito y plataformas digitales.'
    },
    {
      question: '¿Ofrecen armado de PC personalizado?',
      answer: 'Sí, ofrecemos servicio de armado con consejo técnico personalizado según tu presupuesto.'
    },
    {
      question: '¿Hacen envíos a otras ciudades?',
      answer: 'Sí, realizamos envíos a nivel nacional. Consulta costos en nuestra tienda o por WhatsApp.'
    }
  ];

  expandedFaqIndex: number | null = null;

  constructor(private fb: FormBuilder) {
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

  ngOnInit(): void {
    // Inicializar componente
  }

  nextStep(): void {
    if (this.isStepValid()) {
      this.formStep++;
    }
  }

  previousStep(): void {
    if (this.formStep > 1) {
      this.formStep--;
    }
  }

  isStepValid(): boolean {
    switch (this.formStep) {
      case 1:
        const step1Controls = ['name', 'email', 'phone'];
        return step1Controls.every(ctrl => this.contactForm.get(ctrl)?.valid ?? false);
      case 2:
        const step2Controls = ['requestType', 'serviceModality'];
        return step2Controls.every(ctrl => this.contactForm.get(ctrl)?.valid ?? false);
      case 3:
        return (this.contactForm.get('message')?.valid ?? false) && (this.contactForm.get('dataConsent')?.valid ?? false);
      default:
        return false;
    }
  }

  toggleFaq(index: number): void {
    this.expandedFaqIndex = this.expandedFaqIndex === index ? null : index;
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const value = this.contactForm.getRawValue();
    const message = [
      'Hola PC Gamer CDMX, quiero hacer una solicitud desde el sitio.',
      `Nombre: ${value.name}`,
      `Correo: ${value.email}`,
      `Telefono: ${value.phone}`,
      `Tipo: ${value.requestType}`,
      `Modalidad: ${value.serviceModality}`,
      value.city ? `Ciudad: ${value.city}` : '',
      value.budgetRange ? `Presupuesto: ${value.budgetRange}` : '',
      `Mensaje: ${value.message}`,
    ].filter(Boolean).join('\n');

    this.submitted = true;
    this.successMessage = 'Abrimos WhatsApp con tu solicitud lista para enviar.';

    if (typeof window !== 'undefined') {
      window.open(buildWhatsAppUrl(message), '_blank');
    }

    setTimeout(() => {
      this.contactForm.reset();
      this.formStep = 1;
      this.submitted = false;
      this.successMessage = '';
    }, 3000);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
