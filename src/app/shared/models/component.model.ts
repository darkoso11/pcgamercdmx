/**
 * COMPONENT PRODUCT MODEL
 * Interface for individual PC components
 * Represents CPU, GPU, RAM, Storage, etc.
 */

import { BaseProduct, ProductVariant, ProductCategory } from './product.model';

/**
 * Component Type Union
 * All possible component types
 */
export type ComponentType = 'cpu' | 'gpu' | 'ram' | 'storage' | 'motherboard' | 'power-supply' | 'cooling' | 'case';

/**
 * CPU Specifications
 * Processor-specific details
 */
export interface CPUSpecifications {
  brand: 'Intel' | 'AMD';
  model: string;
  generation?: string;
  cores: number;
  threads: number;
  baseClock: string;                // "3.0 GHz"
  boostClock: string;               // "5.8 GHz"
  tdp: number;                      // Watts
  socket: string;                   // "LGA1700", "AM5"
  releaseYear?: number;
  cache?: string;                   // "24MB L3 Cache"
  integratedGraphics?: string;
  architecture?: string;            // "Raptor Lake", "Zen 5"
}

/**
 * GPU Specifications
 * Graphics card-specific details
 */
export interface GPUSpecifications {
  brand: 'NVIDIA' | 'AMD' | 'Intel';
  model: string;
  series: string;                   // "RTX 40 Series", "Radeon RX 7000"
  memorySize: string;               // "24GB", "12GB"
  memoryType: string;               // "GDDR6X", "GDDR6", "GDDR5"
  memoryBus: string;                // "384-bit", "256-bit"
  baseClock?: string;
  boostClock?: string;
  cudaCores?: number;               // Para NVIDIA
  streamProcessors?: number;        // Para AMD
  tdp: number;
  interface: string;                // "PCIe 5.0", "PCIe 4.0"
  releaseYear?: number;
  rtx?: boolean;                    // Ray tracing support
}

/**
 * RAM Specifications
 * Memory-specific details
 */
export interface RAMSpecifications {
  brand: string;                    // "Corsair", "Kingston", "G.Skill"
  model: string;
  type: 'DDR4' | 'DDR5';
  capacity: string;                 // "16GB", "32GB", "64GB"
  speed: string;                    // "3200MHz", "6000MHz"
  voltageRequired?: string;         // "1.35V", "1.5V"
  cas?: number;                     // CAS Latency
  formFactor: string;               // "DIMM", "SO-DIMM"
  modules?: number;                 // Cantidad de módulos en el kit
  heatsink?: boolean;
  lightningRgb?: boolean;           // RGB disponible
}

/**
 * Storage Specifications
 * Drive-specific details
 */
export interface StorageSpecifications {
  brand: string;                    // "Samsung", "WD", "Seagate"
  model: string;
  type: 'SSD' | 'HDD' | 'NVMe';
  capacity: string;                 // "1TB", "2TB", "4TB"
  interface: string;                // "SATA", "NVMe", "M.2"
  speed?: string;                   // "3500MB/s", "7400MB/s"
  rpm?: number;                     // Para HDD
  formFactor: string;               // "2.5\"", "3.5\"", "M.2 2280"
  cache?: string;                   // "256MB", "1GB"
  warranty?: string;                // "5 años", "Lifetime"
}

/**
 * Motherboard Specifications
 * Motherboard-specific details
 */
export interface MotherboardSpecifications {
  brand: string;
  model: string;
  chipset: string;                  // "Z790", "B550"
  socket: string;                   // "LGA1700", "AM5"
  formFactor: string;               // "ATX", "Micro-ATX", "Mini-ITX"
  ramSlots: number;
  ramSupported: string;             // "Up to 192GB DDR5"
  pcie5Slots?: number;
  sataConnectors?: number;
  m2Slots?: number;
  usb3Ports?: number;
  usb2Ports?: number;
  networkPorts?: string;
  wifi?: boolean;
  bluetooth?: boolean;
  bios?: string;                    // BIOS tipo
}

/**
 * Power Supply Specifications
 * PSU-specific details
 */
export interface PowerSupplySpecifications {
  brand: string;
  model: string;
  wattage: number;                  // 550, 650, 750, 1000
  efficiency: string;               // "80+ Bronze", "80+ Gold"
  modular: 'Fully Modular' | 'Semi-Modular' | 'Non-Modular';
  formFactor: string;               // "ATX", "SFX", "Flex"
  connectors?: {
    eightPin?: number;              // 8-pin CPU connectors
    pcie?: number;                  // 6/8-pin PCIE connectors
    sata?: number;                  // SATA power connectors
  };
  voltage?: string;
  protection?: string[];            // ["OCP", "OVP", "SCP"]
  noisyLevel?: string;              // "20dB", "25dB"
  warranty?: string;
}

/**
 * Cooling Specifications
 * CPU cooler or cooling system details
 */
export interface CoolingSpecifications {
  brand: string;
  model: string;
  type: 'Air' | 'Liquid AIO' | 'Liquid Custom';
  socketSupport: string[];          // ["LGA1700", "AM5"]
  radiatorSize?: string;            // "240mm", "360mm" para AIO
  fans?: number;                    // Cantidad de ventiladores
  maxTDP?: number;                  // Watts que puede disipar
  height?: string;                  // "170mm", para clearance checks
  noiseLevel?: string;
  noisyLevel?: string;              // "20dB @ Full Load"
  lightningRgb?: boolean;
}

/**
 * Case Specifications
 * PC case/enclosure details
 */
export interface CaseSpecifications {
  brand: string;
  model: string;
  type: 'Full Tower' | 'Mid Tower' | 'Mini Tower' | 'HTPC' | 'SFF';
  motherboardSupport: string[];     // ["ATX", "Micro-ATX", "Mini-ITX"]
  maxGPULength?: string;            // "380mm"
  maxCPUCoolerHeight?: string;      // "190mm"
  driveBays?: {
    bay35?: number;
    bay25?: number;
    m2?: number;
  };
  fanSupport?: {
    front?: number;
    top?: number;
    rear?: number;
  };
  radiatorSupport?: string[];       // ["240mm", "360mm", "280mm"]
  temperedGlass?: boolean;
  soundDamping?: boolean;
  colors?: string[];                // ["Black", "White", "RGB"]
  dimensions?: {
    width?: number;
    depth?: number;
    height?: number;
  };
}

/**
 * Compatibility Information
 * Details about what this component is compatible with
 */
export interface ComponentCompatibility {
  cpuSocket?: string[];             // ["LGA1700", "LGA1900"] para RAM/Coolers
  motherboardSocket?: string[];
  ramType?: string[];               // ["DDR5"] para motherboards
  gpuSlot?: string;                 // "PCIe 5.0"
  powerRequirement?: number;        // Watts requeridos
  notes?: string;
  incompatibleWith?: string[];      // IDs de productos incompatibles
}

/**
 * Component Product Interface
 * Individual PC component (CPU, GPU, RAM, etc.)
 * Extends BaseProduct with component-specific properties
 */
export interface ComponentProduct extends BaseProduct {
  category: ProductCategory.COMPONENT;

  // Component Type
  componentType: ComponentType;

  // Specifications (dynamic based on type)
  specifications: CPUSpecifications | GPUSpecifications | RAMSpecifications | 
                  StorageSpecifications | MotherboardSpecifications | 
                  PowerSupplySpecifications | CoolingSpecifications | CaseSpecifications;

  // Compatibility Information
  compatibility?: ComponentCompatibility;

  // Variants (different capacities, colors, etc.)
  variants?: ProductVariant[];

  // Related Components
  recommendedWith?: {               // Componentes recomendados para ir juntos
    componentIds?: string[];
    recommendations?: string[];
  };

  // Benchmarks
  benchmarks?: {
    source: string;                 // "UserBenchmark", "TechPowerUp", etc.
    score?: number;
    percentile?: number;
    link?: string;
  };

  // Performance Comparisons
  comparedWith?: {                  // Comparación con competencia
    competitorIds?: string[];
    notes?: string;
  };

  // Additional Info
  form_factor?: string;
  color?: string;
  weight?: string;
  dimensions?: string;
  noiseLevel?: string;
  powerConsumption?: string;
  warranty?: string;

  // Market Positioning
  bestFor?: string[];               // ["Gaming", "Streaming", "Content Creation"]
  competitorName?: string;
  vs?: string;                      // "vs RTX 4080 Super"
}

/**
 * Component Recommendation
 * AI-powered recommendation based on user's build
 */
export interface ComponentRecommendation {
  component: ComponentProduct;
  reason: string;                   // "Best value for gaming", "Most compatible"
  priceRange: {
    min: number;
    max: number;
  };
  score: number;                    // 0-100
}
