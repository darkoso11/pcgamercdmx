export interface SliderItem {
  id?: string | number; // Ahora es opcional con el signo de interrogación
  title?: string;
  description?: string;
  image?: string;
  imageUrl?: string; // Alternativa para imageUrl
  src?: string;      // Alternativa para src
  link?: string;     // Enlace de navegación
  alt?: string;      // Texto alternativo para accesibilidad
  [key: string]: any; // Para permitir propiedades adicionales específicas
}

export interface SliderOptions {
  autoplay?: boolean;
  autoplayDelay?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
  infinite?: boolean;
  slidesToShow?: number;
  slidesToScroll?: number;
}
