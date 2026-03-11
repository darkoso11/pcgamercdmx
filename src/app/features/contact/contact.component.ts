import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
  
  // Métodos de contacto
  contactMethods = [
    {
      id: 1,
      title: 'Teléfono',
      value: '+52 (555) 123-4567',
      icon: 'fas fa-phone',
      action: 'tel:+525551234567'
    },
    {
      id: 2,
      title: 'WhatsApp',
      value: '+52 (555) 123-4567',
      icon: 'fab fa-whatsapp',
      action: 'https://wa.me/525551234567'
    },
    {
      id: 3,
      title: 'Correo',
      value: 'contacto@pcgamer.com',
      icon: 'fas fa-envelope',
      action: 'mailto:contacto@pcgamer.com'
    },
    {
      id: 4,
      title: 'Ubicación',
      value: 'Calle Principal 123, CDMX',
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
  businessHours = [
    { day: 'Lunes - Viernes', hours: '09:00 - 19:00' },
    { day: 'Sábado', hours: '10:00 - 18:00' },
    { day: 'Domingo', hours: 'Cerrado' }
  ];

  // Redes sociales
  socialNetworks = [
    { icon: 'fab fa-facebook-f', url: 'https://facebook.com/pcgamercdmx', name: 'Facebook', color: '#3b5998' },
    { icon: 'fab fa-instagram', url: 'https://instagram.com/pcgamercdmx', name: 'Instagram', color: '#e1306c' },
    { icon: 'fab fa-tiktok', url: 'https://tiktok.com/@pcgamercdmx', name: 'TikTok', color: '#000000' },
    { icon: 'fab fa-youtube', url: 'https://youtube.com/@pcgamercdmx', name: 'YouTube', color: '#ff0000' }
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
    if (this.contactForm.valid) {
      this.submitted = true;
      this.successMessage = '¡Solicitud enviada correctamente! Nos contactaremos pronto.';
      
      // Simular envío de formulario
      setTimeout(() => {
        this.contactForm.reset();
        this.formStep = 1;
        this.submitted = false;
        this.successMessage = '';
      }, 3000);

      console.log('Datos del formulario:', this.contactForm.value);
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
