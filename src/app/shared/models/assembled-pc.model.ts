/**
 * ASSEMBLED PC MODEL
 * Interface for complete assembled PC systems
 * Represents PCs built and sold by PC Gamer CDMX
 */

import { BaseProduct, BrandLogo, PerformanceTier, UseCase, ProductCategory } from './product.model';

/**
 * Component Reference
 * Links to individual components included in the assembled PC
 */
export interface ComponentReference {
  _id: string;                      // ID del componente en BD
  title: string;                    // Nombre del componente
  image?: string;                   // Imagen del componente
  specs?: string;                   // Especificaciones resumidas: "RTX 4090 24GB", "Ryzen 9 7950X"
  price?: number;                   // Precio unitario
  category?: string;                // Tipo de componente
}

/**
 * Performance Specification
 * Summarized hardware performance information
 */
export interface PerformanceSpec {
  gpuBrand: 'NVIDIA' | 'AMD' | 'INTEL';
  gpuMemory: string;                // "12GB GDDR6", "8GB GDDR5"
  cpuBrand: 'Intel' | 'AMD';
  cpuCores: number;
  cpuThreads?: number;
  totalRam: string;                 // "32GB DDR5"
  storageCapacity: string;          // "2TB SSD", "1TB SSD + 2TB HDD"
  maxFPS?: {                        // Estimated FPS for popular games
    game: string;                   // "Cyberpunk 2077", "CS2"
    fps_1080p?: number;
    fps_1440p?: number;
    fps_4k?: number;
  }[];
}

/**
 * Power Certification
 * Power supply certification and specifications
 */
export interface PowerCertification {
  certificate: '80+ Bronze' | '80+ Silver' | '80+ Gold' | '80+ Platinum' | 'Non-certified';
  wattage: number;                  // 550W, 650W, 750W, 1000W
  manufacturer?: string;            // "Corsair", "EVGA", etc.
  modular?: 'Full' | 'Semi' | 'Non';
}

/**
 * Assembled PC Interface
 * Complete representation of a built PC system
 * Extends BaseProduct with PC-specific properties
 */
export interface AssembledPC extends BaseProduct {
  category: ProductCategory.ASSEMBLED;

  // Hardware Components
  specifications: {
    processor: ComponentReference;       // CPU
    motherboard: ComponentReference;     // Placa base
    ram: ComponentReference;             // Memoria RAM
    storage: ComponentReference[];       // Puede haber múltiples (SSD + HDD)
    graphicsCard: ComponentReference;    // GPU
    powerSupply: ComponentReference;     // Fuente de poder
    case: ComponentReference;            // Gabinete/caja
    cooling: ComponentReference;         // Sistema de refrigeración
    additionalComponents?: ComponentReference[];  // Otros (ventiladores, filtros, etc.)
  };

  // Performance Information
  performance: PerformanceSpec;

  // Power Certification
  certifications: PowerCertification;

  // Branding
  brandLogos: BrandLogo[];            // NVIDIA, AMD, Intel, etc.

  // Positioning
  useCase: UseCase;                   // Gaming, Streaming, Editing, Workstation
  performanceTier: PerformanceTier;   // Entry, Mid, High, Ultra
  targetAudience?: string;            // Descripción del público objetivo

  // Related Products
  relatedProducts?: string[];         // IDs de PCs relacionadas
  recommendedPeripherals?: {          // Periféricos recomendados
    peripheralIds?: string[];
    recommendations?: string[];      // Texto de recomendaciones
  };

  // Customization Options
  customizable?: boolean;             // ¿Permite personalizaciones?
  customizationOptions?: {
    ram?: string[];                   // Opciones de RAM
    storage?: string[];               // Opciones de almacenamiento
    graphicsCard?: string[];          // Opciones de GPU
  };

  // Warranty & Support
  warranty?: {
    duration: number;                 // Meses de garantía
    type: string;                     // "Parts & Labor", "Parts Only", etc.
    provider?: string;                // Empresa que provee garantía
  };

  // Shipping & Assembly
  readyToShip?: boolean;
  estimatedDelivery?: {
    min: number;                      // Días mínimos
    max: number;                      // Días máximos
  };
  preBuilt?: boolean;                 // ¿Llega ya armada?
  freeShipping?: boolean;

  // Additional Notes
  highlights?: string[];              // Puntos clave de venta
  notes?: string;                     // Notas adicionales para clientes
}

/**
 * Assembled PC Bundle
 * Multiple PCs bundled together with a discount
 */
export interface AssembledPCBundle {
  _id?: string;
  name: string;
  description: string;
  pcIds: string[];                   // IDs de las PCs incluidas
  bundleDiscount: number;            // Porcentaje de descuento
  includedItems?: string[];          // Items adicionales incluidos
  totalPrice: number;
  bundledPrice: number;
  savings: number;
  validUntil?: Date;
  active: boolean;
}

/**
 * PC Comparison
 * For comparing multiple assembled PCs side by side
 */
export interface PCComparison {
  pcs: AssembledPC[];
  comparisonDate: Date;
  userNotes?: string;
}
