/**
 * PERIPHERAL PRODUCT MODEL
 * Interface for gaming peripherals and accessories
 * Keyboards, mice, monitors, headsets, mousepads
 */

import { BaseProduct, ProductVariant, ProductCategory } from './product.model';

/**
 * Peripheral Type Union
 * All possible peripheral types
 */
export type PeripheralType = 'keyboard' | 'mouse' | 'monitor' | 'headset' | 'mousepad';

/**
 * Keyboard Specifications
 * Gaming keyboard-specific details
 */
export interface KeyboardSpecifications {
  brand: string;
  model: string;
  keyType: 'Mechanical' | 'Membrane' | 'Hybrid';
  keySwitch?: string;               // "Cherry MX Red", "Huano Blue"
  switchBrand?: string;             // "Cherry", "Gateron", "Huano"
  layout: 'Full Size' | 'TKL' | '75%' | '65%' | '60%' | '40%';
  backlight: 'RGB' | 'Monochrome' | 'None';
  backlightBrightness?: string;
  connectionType: 'Wired' | 'Wireless' | '2.4GHz Wireless';
  batteryLife?: string;             // Para wireless
  rollOver?: string;                // "N-key rollover"
  macros?: boolean;
  programmable?: boolean;
  weight?: string;
  dimensions?: string;
  materials?: string;
  customizable?: boolean;           // Hot-swap compatible
}

/**
 * Mouse Specifications
 * Gaming mouse-specific details
 */
export interface MouseSpecifications {
  brand: string;
  model: string;
  dpi: {
    min: number;
    max: number;
  };
  sensor?: string;                  // "PixArt PMW3389", "Focus Pro 30K"
  sensorType?: string;              // "Optical", "Laser"
  buttons: number;
  gripType?: 'Palm' | 'Claw' | 'Fingertip' | 'Universal';
  weight?: string;                  // "69g"
  weightAdjustable?: boolean;
  connectionType: 'Wired' | 'Wireless' | '2.4GHz Wireless' | 'Bluetooth';
  batteryLife?: string;
  polling?: number;                 // 125Hz, 500Hz, 1000Hz
  acceleration?: number;
  responseTime?: number;            // En ms
  shape?: string;
  colors?: string[];
  sideButtons?: number;
  materials?: string;
  warranty?: string;
}

/**
 * Monitor Specifications
 * Gaming monitor-specific details
 */
export interface MonitorSpecifications {
  brand: string;
  model: string;
  size: string;                     // "27 inches", "24 inches"
  sizeInches: number;
  resolution: string;               // "2560x1440", "1920x1080"
  panelType: 'IPS' | 'VA' | 'TN' | 'OLED';
  refreshRate: number;              // 144, 240, 360
  responseTime: number;             // 1ms, 0.5ms
  responseTimeType?: string;        // "MPRT", "GtG"
  hdmi?: number;                    // Cantidad de puertos
  displayPort?: number;
  usb?: number;
  brightness?: number;              // Nits
  contrast?: string;                // "3000:1"
  colorGamut?: string;              // "sRGB", "DCI-P3"
  gsync?: boolean;                  // NVIDIA G-Sync
  freesync?: boolean;               // AMD FreeSync
  freesynclevel?: string;           // "Premium", "Premium Pro"
  hdr?: boolean;
  vesa?: string;                    // VESA mount compatibility
  speakers?: boolean;
  speakersWattage?: number;
  height_adjustable?: boolean;
  tilt?: string;
  pivot?: boolean;
  curve?: boolean;
  curvature?: string;               // "1800R", "2300R"
  warranty?: string;
  color?: string;
  dimensions?: string;
  weight?: string;
}

/**
 * Headset Specifications
 * Gaming headset-specific details
 */
export interface HeadsetSpecifications {
  brand: string;
  model: string;
  type: 'Over-Ear' | 'On-Ear' | 'In-Ear';
  driver?: string;                  // "50mm", "40mm"
  driverType?: string;              // "Dynamic", "Balanced Armature"
  impedance?: string;               // "32 Ohm"
  frequencyRange?: string;          // "20Hz-20kHz"
  sensitivity?: string;             // "98dB"
  connectionType: 'Wired' | 'Wireless' | '2.4GHz Wireless' | 'Bluetooth' | 'USB';
  batteryLife?: string;
  noiseCancel?: boolean;
  activenoiscancel?: boolean;
  microphone?: boolean;
  microphoneDetachable?: boolean;
  surround?: string;               // "7.1", "Dolby Atmos"
  colorOptions?: string[];
  materialEarpad?: string;
  weight?: string;
  warranty?: string;
  compatible?: string[];           // ["PC", "PS5", "Xbox"]
  foldable?: boolean;
  cableLength?: string;
}

/**
 * Mousepad Specifications
 * Gaming mousepad-specific details
 */
export interface MousepadSpecifications {
  brand: string;
  model: string;
  size: string;                     // "Large", "Medium", "Small"
  dimensions: string;               // "900x400mm", "320x220mm"
  material: string;                 // "Cloth", "Hard Plastic", "Rubber"
  thickness?: string;
  surface?: string;                 // "Smooth", "Textured"
  wireless?: boolean;
  builtin_charger?: boolean;
  backlight?: string;               // "RGB", "Monochrome", "None"
  nonSlip?: boolean;
  waterproof?: boolean;
  stitched_edges?: boolean;
  color?: string;
  weight?: string;
  warranty?: string;
}

/**
 * Peripheral Rating
 * User reviews and ratings for peripherals
 */
export interface PeripheralRating {
  average: number;                  // 0-5 stars
  count: number;                    // Total reviews
  reviews?: {
    rating: number;
    title: string;
    comment: string;
    author: string;
    verified: boolean;
    helpful: number;
    date: Date;
  }[];
}

/**
 * Peripheral Compatibility
 * What systems/devices this peripheral works with
 */
export interface PeripheralCompatibility {
  platforms: ('PC' | 'Mac' | 'Linux' | 'PS5' | 'Xbox' | 'Switch')[];
  operatingSystem?: string[];       // ["Windows 10", "macOS 12+", "Linux"]
  requiresDriver?: boolean;
  notes?: string;
  incompatibleWith?: string[];      // IDs de productos incompatibles
}

/**
 * Peripheral Product Interface
 * Gaming peripheral (keyboard, mouse, monitor, headset, mousepad)
 * Extends BaseProduct with peripheral-specific properties
 */
export interface PeripheralProduct extends BaseProduct {
  category: ProductCategory.PERIPHERAL;

  // Peripheral Type
  peripheralType: PeripheralType;

  // Specifications (dynamic based on type)
  specifications: KeyboardSpecifications | MouseSpecifications | 
                  MonitorSpecifications | HeadsetSpecifications | MousepadSpecifications;

  // Compatibility Information
  compatibility?: PeripheralCompatibility;

  // Variants (colors, sizes, etc.)
  variants?: ProductVariant[];

  // Features
  features: string[];               // "RGB Lighting", "Programmable", "Wireless", etc.

  // User Ratings & Reviews
  rating?: PeripheralRating;

  // Related Products
  recommendedWith?: {               // Periféricos recomendados para ir juntos
    peripheralIds?: string[];
    recommendations?: string[];
  };

  // Professional Reviews & Links
  externalReviews?: {
    source: string;                 // "YouTube", "Amazon", "TechPowerUp"
    url?: string;
    rating?: number;
    date?: Date;
  }[];

  // Professional Recommendations
  professionalRecommendations?: {
    streamers?: string[];           // Streamers que lo usan
    proGamers?: string[];           // Pro gamers que lo usan
    contentCreators?: string[];
  };

  // Best For
  bestFor?: string[];               // ["Competitive Gaming", "MMORPGs", "Content Creation"]

  // Positioning
  gamingStyle?: string;             // "Competitive", "Casual", "Professional"
  expertiseLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';

  // Additional Info
  color?: string;
  material?: string;
  powerRequirement?: string;
  warranty?: string;
}

/**
 * Peripheral Bundle
 * Multiple peripherals bundled together with a discount
 */
export interface PeripheralBundle {
  _id?: string;
  name: string;
  description: string;
  peripheralIds: string[];
  bundleDiscount: number;           // Porcentaje de descuento
  includedItems?: string[];
  totalPrice: number;
  bundledPrice: number;
  savings: number;
  validUntil?: Date;
  active: boolean;
}

/**
 * Setup Recommendation
 * Recommended peripherals for a specific gaming setup
 */
export interface SetupRecommendation {
  setupType: 'Casual' | 'Competitive' | 'Streaming' | 'Content Creation';
  peripherals: {
    keyboard?: PeripheralProduct;
    mouse?: PeripheralProduct;
    monitor?: PeripheralProduct;
    headset?: PeripheralProduct;
    mousepad?: PeripheralProduct;
  };
  totalPrice: number;
  compatibilityNotes?: string;
}
