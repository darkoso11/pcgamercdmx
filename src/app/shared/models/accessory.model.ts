/**
 * ACCESSORY PRODUCT MODEL
 * Interface for PC accessories
 * Cables, RGB lighting, USB hubs, stands, coolers, etc.
 */

import { BaseProduct, ProductVariant, ProductCategory } from './product.model';

/**
 * Accessory Type Union
 * All possible accessory types
 */
export type AccessoryType = 'cable' | 'rgb-lighting' | 'usb-hub' | 'stand' | 'cooler' | 'other';

/**
 * Cable Specifications
 * Cable-specific details
 */
export interface CableSpecifications {
  brand: string;
  model: string;
  type: string;                     // "USB-C to USB-C", "DisplayPort 1.4", "HDMI 2.1"
  standard?: string;                // "USB 3.2", "Thunderbolt 3"
  length: string;                   // "2m", "3m"
  gauge?: string;                   // "24AWG"
  maxCurrent?: string;              // "240W", "100W"
  shielded?: boolean;
  braided?: boolean;
  color?: string;
  connectorType?: string;
  warranty?: string;
}

/**
 * RGB Lighting Specifications
 * RGB strip or fan specifications
 */
export interface RGBLightingSpecifications {
  brand: string;
  model: string;
  type: string;                     // "RGB Strip", "RGB Fan", "RGB Hub"
  length?: string;                  // "1m", "2m"
  ledCount?: number;
  ledType?: string;                 // "5050", "3528"
  color?: string;
  controller: 'Manual' | 'Remote' | 'Software' | 'Music Reactive';
  connectivity?: string;            // "USB", "3-pin header"
  modeCount?: number;               // Número de modos de iluminación
  brightness?: string;
  colors?: number;                  // Número de colores soportados
  warranty?: string;
}

/**
 * USB Hub Specifications
 * USB hub details
 */
export interface USBHubSpecifications {
  brand: string;
  model: string;
  ports: number;
  portTypes: string[];              // ["USB 3.0", "USB 2.0", "USB-C"]
  maxDataRate?: string;             // "480Mbps", "5Gbps"
  powerDelivery?: boolean;
  powerDeliveryWatts?: number;
  material?: string;
  connection?: string;              // "USB-C", "USB-A"
  warranty?: string;
}

/**
 * Stand Specifications
 * Monitor or device stand details
 */
export interface StandSpecifications {
  brand: string;
  model: string;
  compatibility?: string;           // "27\" monitors", "iPad"
  material?: string;
  adjustable?: boolean;
  height?: {
    min: string;
    max: string;
  };
  tilt?: boolean;
  rotation?: boolean;
  swivel?: boolean;
  maxWeight?: string;
  color?: string;
  dimensions?: string;
  warranty?: string;
}

/**
 * Cooler Specifications
 * Additional cooling solution details
 */
export interface CoolerSpecifications {
  brand: string;
  model: string;
  type: string;                     // "Case Fan", "Exhaust Fan", "Intake Fan"
  size: string;                     // "120mm", "140mm"
  rpm?: {
    min: number;
    max: number;
  };
  airflow?: string;                 // "60 CFM"
  noiseLevel?: string;              // "20dB @ max"
  connection?: string;              // "3-pin", "4-pin PWM"
  bearing?: string;                 // "Ball", "Sleeve", "Fluid"
  color?: string;
  backlight?: string;               // "RGB", "None"
  warranty?: string;
}

/**
 * Other Accessory Specifications
 * Generic specifications for other accessories
 */
export interface OtherAccessorySpecifications {
  brand: string;
  model: string;
  type: string;
  description?: string;
  material?: string;
  color?: string;
  size?: string;
  weight?: string;
  warranty?: string;
  [key: string]: any;               // Permite propiedades dinámicas
}

/**
 * Accessory Product Interface
 * PC accessories (cables, RGB, USB hubs, etc.)
 * Extends BaseProduct with accessory-specific properties
 */
export interface AccessoryProduct extends BaseProduct {
  category: ProductCategory.ACCESSORY;

  // Accessory Type
  accessoryType: AccessoryType;

  // Specifications (dynamic based on type)
  specifications: CableSpecifications | RGBLightingSpecifications | 
                  USBHubSpecifications | StandSpecifications | 
                  CoolerSpecifications | OtherAccessorySpecifications;

  // Variants (different lengths, colors, etc.)
  variants?: ProductVariant[];

  // Compatibility
  compatibility?: {
    devices?: string[];             // Dispositivos compatibles
    notes?: string;
  };

  // Bundle-ready
  bundleReady?: boolean;
  frequentlyBoughtWith?: string[];  // IDs de productos frecuentemente comprados juntos

  // Additional Info
  warranty?: string;
  quantity?: number;                // Si viene en paquete múltiple
  bulkDiscount?: boolean;
}

/**
 * PC Maintenance Kit
 * Bundle of accessories for PC maintenance
 */
export interface PCMaintenanceKit {
  _id?: string;
  name: string;
  description: string;
  items: {
    accessoryId: string;
    quantity: number;
  }[];
  totalPrice: number;
  kitPrice: number;
  savings: number;
  active: boolean;
}

/**
 * Cable Manager Bundle
 * Bundle of cables and management accessories
 */
export interface CableManagerBundle {
  _id?: string;
  name: string;
  cables: string[];                 // IDs de cables
  management: string[];             // IDs de herramientas de gestión
  totalPrice: number;
  bundlePrice: number;
  active: boolean;
}
